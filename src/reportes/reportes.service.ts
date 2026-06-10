import { BadRequestException, Injectable } from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type VentaResumen = {
    id: string;
    date: string;
    createdAt: string;
    serviceType: string;
    paymentMethod: string;
    amount: number;
    commissionAmount: number;
    companyNet: number;
    collaboratorId?: string | null;
    clientName?: string | null;
};

type ProyectoResumen = {
    id: string;
    name: string;
    endDate?: string | null;
    budget: number;
    totalExpenses: number;
    totalProfit: number;
};

@Injectable()
export class ReportesService {
    constructor(private prisma: PrismaService) { }

    private toStartIso(date: string) {
        return new Date(`${date}T00:00:00.000Z`).toISOString();
    }

    private toEndIso(date: string) {
        return new Date(`${date}T23:59:59.999Z`).toISOString();
    }

    private money(value?: number | null) {
        return Number(value ?? 0);
    }

    async getGanancias(from: string, to: string) {
        if (!from || !to) {
            throw new BadRequestException('from y to son obligatorios');
        }

        const fromIso = this.toStartIso(from);
        const toIso = this.toEndIso(to);

        const ventas = await this.prisma.ventaServicio.findMany({
            where: {
                createdAt: {
                    gte: fromIso,
                    lte: toIso,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const ventasActivas = ventas.filter((v) => v.deletedAt == null);

        const salesSummary = ventasActivas.reduce(
            (acc, venta) => {
                acc.count += 1;
                acc.totalAmount += this.money(venta.amount);
                acc.totalCommissionAmount += this.money(venta.commissionAmount);
                acc.totalCompanyNet += this.money(venta.companyNet);

                const item: VentaResumen = {
                    id: venta.id,
                    date: venta.date,
                    createdAt: venta.createdAt,
                    serviceType: venta.serviceType,
                    paymentMethod: venta.paymentMethod,
                    amount: this.money(venta.amount),
                    commissionAmount: this.money(venta.commissionAmount),
                    companyNet: this.money(venta.companyNet),
                    collaboratorId: venta.collaboratorId,
                    clientName: venta.clientName,
                };

                acc.items.push(item);
                return acc;
            },
            {
                count: 0,
                totalAmount: 0,
                totalCommissionAmount: 0,
                totalCompanyNet: 0,
                items: [] as VentaResumen[],
            }
        );

        const proyectos = await this.prisma.proyecto.findMany({
            where: {
                status: ProjectStatus.FINALIZADA,
                endDate: {
                    gte: from,
                    lte: to,
                },
            },
            orderBy: {
                endDate: 'desc',
            },
        });

        const projectIds = proyectos.map((p) => p.id);

        const gastos = projectIds.length
            ? await this.prisma.gastoProyecto.findMany({
                where: {
                    projectId: {
                        in: projectIds,
                    },
                },
            })
            : [];

        const gastosPorProyecto = gastos.reduce<Record<string, number>>((acc, gasto) => {
            acc[gasto.projectId] = (acc[gasto.projectId] ?? 0) + this.money(gasto.amount);
            return acc;
        }, {});

        const projectDetails = proyectos.map((p) => {
            const totalExpenses = this.money(gastosPorProyecto[p.id] ?? 0);
            const budget = this.money(p.budget);
            const totalProfit = Number((budget - totalExpenses).toFixed(2));

            const item: ProyectoResumen = {
                id: p.id,
                name: p.name,
                endDate: p.endDate,
                budget,
                totalExpenses,
                totalProfit,
            };

            return item;
        });

        const projectSummary = projectDetails.reduce(
            (acc, proyecto) => {
                acc.count += 1;
                acc.totalBudget += proyecto.budget;
                acc.totalExpenses += proyecto.totalExpenses;
                acc.totalProfit += proyecto.totalProfit;
                acc.items.push(proyecto);
                return acc;
            },
            {
                count: 0,
                totalBudget: 0,
                totalExpenses: 0,
                totalProfit: 0,
                items: [] as ProyectoResumen[],
            }
        );

        const totalCompanyProfit = Number(
            (salesSummary.totalCompanyNet + projectSummary.totalProfit).toFixed(2)
        );

        return {
            from,
            to,
            sales: salesSummary,
            projects: projectSummary,
            totals: {
                companyProfit: totalCompanyProfit,
                collaboratorCommissions: Number(salesSummary.totalCommissionAmount.toFixed(2)),
                salesCompanyNet: Number(salesSummary.totalCompanyNet.toFixed(2)),
                projectProfit: Number(projectSummary.totalProfit.toFixed(2)),
            },
        };
    }
}