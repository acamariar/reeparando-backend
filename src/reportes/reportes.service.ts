import { BadRequestException, Injectable } from '@nestjs/common';
import { EstadoSeguimiento, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';



//ventaresumen es ahora seguimientos, conserve los nombres para ahorrar tiempo, pero se puede cambiar en el futuro
type VentaResumen = {
    id: string;
    date: string;
    createdAt: string;
    serviceCode?: string | null;
    serviceType: string;
    paymentMethod: string | null;
    amount: number;
    commissionAmount: number;
    companyNet: number;
    collaboratorId?: string | null;
    clientName?: string | null;

    numeroVisita?: string | null;
    fechaSolicitud?: string | null;
    fechaFinalizacion?: string | null;
};

type ProyectoResumen = {
    id: string;
    name: string;
    endDate?: string | null;
    budget: number;
    totalExpenses: number;
    totalProfit: number;
};

type CompraResumen = {
    id: string;
    date: string;
    concept: string;
    category: string;
    provider?: string | null;
    invoiceRef: string;
    amount: number;
};

@Injectable()
export class ReportesService {
    constructor(private prisma: PrismaService) { }

    private money(value?: number | null) {
        return Number(value ?? 0);
    }

    async getGanancias(from: string, to: string) {
        if (!from || !to) {
            throw new BadRequestException('from y to son obligatorios');
        }

        const ventas = await this.prisma.seguimiento.findMany({
            where: {
                estado: EstadoSeguimiento.CULMINADO,
                fechaFinalizacion: {
                    gte: from,
                    lte: to,
                },
                deletedAt: null,
            },
            orderBy: {
                fechaFinalizacion: 'desc',
            },
            include: {
                client: true,
                colaborador: true,
            },
        });

        const ventasResumen = ventas.reduce(
            (acc, seguimiento) => {
                acc.count += 1;
                acc.totalAmount += this.money(seguimiento.montoPagadoCliente);
                acc.totalCommissionAmount += this.money(seguimiento.montoColaborador);
                acc.totalCompanyNet += this.money(seguimiento.montoReeparando);

                acc.items.push({
                    id: seguimiento.id,
                    date: seguimiento.fechaFinalizacion ?? seguimiento.fechaSolicitud,
                    createdAt: seguimiento.createdAt,
                    serviceCode: seguimiento.numeroVisita,
                    serviceType: seguimiento.tipoServicio ?? seguimiento.tipoVisita,
                    paymentMethod: seguimiento.paymentMethod ?? null,
                    amount: this.money(seguimiento.montoPagadoCliente),
                    commissionAmount: this.money(seguimiento.montoColaborador),
                    companyNet: this.money(seguimiento.montoReeparando),
                    collaboratorId: seguimiento.colaboradorId,
                    clientName: seguimiento.client
                        ? `${seguimiento.client.firstName} ${seguimiento.client.lastName}`
                        : null,
                    numeroVisita: seguimiento.numeroVisita,
                    fechaSolicitud: seguimiento.fechaSolicitud,
                    fechaFinalizacion: seguimiento.fechaFinalizacion ?? null,
                });
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

        const proyectosResumen = proyectos.map((p) => {
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

        const projectsSummary = proyectosResumen.reduce(
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

        const compras = await this.prisma.compraEmpresa.findMany({
            where: {
                date: {
                    gte: from,
                    lte: to,
                },
                deletedAt: null,
            },
            orderBy: {
                date: 'desc',
            },
        });

        const comprasResumen = compras.reduce(
            (acc, compra) => {
                acc.count += 1;
                acc.totalAmount += this.money(compra.amount);

                acc.items.push({
                    id: compra.id,
                    date: compra.date,
                    concept: compra.concept,
                    category: compra.category,
                    provider: compra.provider,
                    invoiceRef: compra.invoiceRef,
                    amount: this.money(compra.amount),
                });

                return acc;
            },
            {
                count: 0,
                totalAmount: 0,
                items: [] as CompraResumen[],
            }
        );

        const totalGrossProfit = Number(
            (ventasResumen.totalCompanyNet + projectsSummary.totalProfit).toFixed(2)
        );

        const totalNetProfit = Number(
            (totalGrossProfit - comprasResumen.totalAmount).toFixed(2)
        );

        return {
            from,
            to,
            sales: ventasResumen,
            projects: projectsSummary,
            purchases: comprasResumen,
            totals: {
                companyProfit: totalGrossProfit,
                companyProfitAfterPurchases: totalNetProfit,
                collaboratorCommissions: Number(ventasResumen.totalCommissionAmount.toFixed(2)),
                salesCompanyNet: Number(ventasResumen.totalCompanyNet.toFixed(2)),
                projectProfit: Number(projectsSummary.totalProfit.toFixed(2)),
                purchaseAmount: Number(comprasResumen.totalAmount.toFixed(2)),
            },
        };
    }
}