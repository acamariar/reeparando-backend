import { BadRequestException, Injectable } from '@nestjs/common';
import {
    EstadoSeguimiento,
    Prisma,
    TipoVisitaSeguimiento,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type SeguimientoConRelaciones = Prisma.SeguimientoGetPayload<{
    include: {
        client: true;
        colaborador: true;
    };
}>;

type PanelVisitItem = {
    id: string;
    numeroVisita: string;
    fechaSolicitud: string;
    fechaVisita?: string | null;
    horaVisita?: string | null;
    estado: EstadoSeguimiento;
    tipoVisita: TipoVisitaSeguimiento;
    servicioRequerido: string;
    tipoServicio?: string | null;
    direccionServicio: string;
    zona?: string | null;
    clientName: string;
    clientPhone?: string | null;
    colaboradorName: string;
    collaboratorPhone?: string | null;
    agendaLabel: string;
    fichaText: string;
    reminderClientText: string;
    reminderCollaboratorText: string;
    whatsappClientUrl: string;
    whatsappCollaboratorUrl: string;
};

type PanelBucket = {
    count: number;
    items: PanelVisitItem[];
};

@Injectable()
export class PanelService {
    constructor(private readonly prisma: PrismaService) { }

    private readonly timeZone = 'America/Argentina/Buenos_Aires';

    private dateOnlyFromDate(date: Date) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: this.timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).formatToParts(date);

        const year = parts.find((p) => p.type === 'year')?.value ?? '0000';
        const month = parts.find((p) => p.type === 'month')?.value ?? '01';
        const day = parts.find((p) => p.type === 'day')?.value ?? '01';

        return `${year}-${month}-${day}`;
    }

    private todayIso() {
        return this.dateOnlyFromDate(new Date());
    }

    private normalizeDate(date?: string) {
        if (!date) return this.todayIso();

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
        }

        return date;
    }

    private addDaysIso(isoDate: string, days: number) {
        const date = new Date(`${isoDate}T00:00:00-03:00`);
        date.setDate(date.getDate() + days);
        return this.dateOnlyFromDate(date);
    }

    private formatLongDate(value?: string | null) {
        if (!value) return '—';

        const date = new Date(`${value}T00:00:00-03:00`);
        if (Number.isNaN(date.getTime())) return value;

        return new Intl.DateTimeFormat('es-AR', {
            dateStyle: 'long',
            timeZone: this.timeZone,
        }).format(date);
    }

    private formatTime(value?: string | null) {
        if (!value) return null;

        const raw = value.trim();

        if (/^\d{1,2}$/.test(raw)) {
            return `${raw.padStart(2, '0')}:00`;
        }

        if (/^\d{1,2}:\d{2}$/.test(raw)) {
            const [hours, minutes] = raw.split(':');
            return `${hours.padStart(2, '0')}:${minutes}`;
        }

        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime()) && raw.includes('T')) {
            return new Intl.DateTimeFormat('es-AR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: this.timeZone,
            }).format(parsed);
        }

        return raw;
    }

    private normalizePhone(phone?: string | null) {
        const digits = (phone ?? '').replace(/\D/g, '');
        if (!digits) return '';
        if (digits.startsWith('54')) return digits;
        return `54${digits}`;
    }

    private collaboratorFullName(item: SeguimientoConRelaciones) {
        if (!item.colaborador) return '—';

        const base = `${item.colaborador.firstName} ${item.colaborador.lastName}`.trim();
        return item.colaborador.alias ? `${base} · ${item.colaborador.alias}` : base;
    }

    private clientFullName(item: SeguimientoConRelaciones) {
        if (!item.client) return '—';
        return `${item.client.firstName} ${item.client.lastName}`.trim();
    }

    private agendaLabel(item: SeguimientoConRelaciones) {
        const dateLabel = this.formatLongDate(item.fechaVisita);
        const timeLabel = this.formatTime(item.horaVisita);

        if (dateLabel === '—') return '—';
        if (!timeLabel) return dateLabel;

        return `${dateLabel} a las ${timeLabel} hs`;
    }

    private buildReminderClientText(item: SeguimientoConRelaciones) {
        return [
            `Hola ${this.clientFullName(item)}, te recordamos tu visita ${item.numeroVisita}.`,
            `Agenda: ${this.agendaLabel(item)}.`,
            `Dirección: ${item.direccionServicio}.`,
            `Servicio: ${item.servicioRequerido}.`,
        ].join(' ');
    }

    private buildReminderCollaboratorText(item: SeguimientoConRelaciones) {
        return [
            `Recordatorio de visita ${item.numeroVisita}.`,
            `Cliente: ${this.clientFullName(item)}.`,
            `Agenda: ${this.agendaLabel(item)}.`,
            `Dirección: ${item.direccionServicio}.`,
            `Servicio: ${item.servicioRequerido}.`,
        ].join(' ');
    }

    private buildWhatsappUrl(phone: string, text: string) {
        if (!phone) return '';
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    }

    private buildFichaText(item: SeguimientoConRelaciones) {
        return [
            `${item.numeroVisita} ${this.collaboratorFullName(item).toUpperCase()}/${this.clientFullName(item).toUpperCase()}/${(item.zona ?? 'SIN ZONA').toUpperCase()}`,
            '',
            `Cliente: ${this.clientFullName(item)}`,
            `Dirección: ${item.direccionServicio}`,
            `Zona: ${item.zona ?? '—'}`,
            `Contactó: ${item.client?.phone ?? '—'}`,
            `Agenda de visita: ${this.agendaLabel(item)}`,
            `Técnico: ${this.collaboratorFullName(item)}`,
            `Servicio requerido: ${item.servicioRequerido}`,
            `Tipo de servicio: ${item.tipoServicio ?? '—'}`,
            `Fecha de solicitud: ${this.formatLongDate(item.fechaSolicitud)}`,
            `Estado: ${item.estado}`,
            `Presupuesto: ${item.tipoVisita === 'TECNICA' ? `$${Number(item.montoPresupuestado ?? 0).toLocaleString('es-AR')}` : 'A presupuestar'}`,
        ].join('\n');
    }

    private mapItem(item: SeguimientoConRelaciones): PanelVisitItem {
        const clientPhone = item.client?.phone ?? null;
        const collaboratorPhone = item.colaborador?.phone ?? null;

        const reminderClientText = this.buildReminderClientText(item);
        const reminderCollaboratorText = this.buildReminderCollaboratorText(item);

        return {
            id: item.id,
            numeroVisita: item.numeroVisita,
            fechaSolicitud: item.fechaSolicitud,
            fechaVisita: item.fechaVisita,
            horaVisita: item.horaVisita,
            estado: item.estado,
            tipoVisita: item.tipoVisita,
            servicioRequerido: item.servicioRequerido,
            tipoServicio: item.tipoServicio,
            direccionServicio: item.direccionServicio,
            zona: item.zona,
            clientName: this.clientFullName(item),
            clientPhone,
            colaboradorName: this.collaboratorFullName(item),
            collaboratorPhone,
            agendaLabel: this.agendaLabel(item),
            fichaText: this.buildFichaText(item),
            reminderClientText,
            reminderCollaboratorText,
            whatsappClientUrl: this.buildWhatsappUrl(
                this.normalizePhone(clientPhone),
                reminderClientText,
            ),
            whatsappCollaboratorUrl: this.buildWhatsappUrl(
                this.normalizePhone(collaboratorPhone),
                reminderCollaboratorText,
            ),
        };
    }

    private async getBucket(where: Prisma.SeguimientoWhereInput): Promise<PanelBucket> {
        const items = await this.prisma.seguimiento.findMany({
            where,
            orderBy: [
                { horaVisita: 'asc' },
                { numeroVisita: 'asc' },
            ],
            include: {
                client: true,
                colaborador: true,
            },
        });

        return {
            count: items.length,
            items: items.map((item) => this.mapItem(item)),
        };
    }

    async getResumen(date?: string) {
        const currentDate = this.normalizeDate(date);
        const nextDate = this.addDaysIso(currentDate, 1);

        const openWhere: Prisma.SeguimientoWhereInput = {
            deletedAt: null,
            estado: {
                notIn: [EstadoSeguimiento.CULMINADO, EstadoSeguimiento.RECHAZADO],
            },
        };

        const [today, tomorrow, overdue] = await Promise.all([
            this.getBucket({
                ...openWhere,
                fechaVisita: currentDate,
            }),
            this.getBucket({
                ...openWhere,
                fechaVisita: nextDate,
            }),
            this.getBucket({
                ...openWhere,
                fechaVisita: {
                    lt: currentDate,
                },
            }),
        ]);

        return {
            date: currentDate,
            nextDate,
            today,
            tomorrow,
            overdue,
            alerts: {
                todayPending: today.count,
                tomorrowPending: tomorrow.count,
                overduePending: overdue.count,
                totalPending: today.count + tomorrow.count + overdue.count,
            },
        };
    }
}