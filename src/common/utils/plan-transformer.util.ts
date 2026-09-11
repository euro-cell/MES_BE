import { ProcessTemplateItem } from '../entities/project/process-template-item.entity';
import { ProjectPlanItem } from '../entities/project/project-plan-item.entity';

export function planItemKey(group: string, name: string, type?: string | null): string {
  return type ? `${group}_${name}_${type}` : `${group}_${name}`;
}

export class PlanTransformerUtil {
  static weekHeaders(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const result: { month: number; weeks: { week: number; range: number[] }[] }[] = [];

    for (let y = start.getFullYear(), m = start.getMonth(); y <= end.getFullYear(); ) {
      const firstDayOfMonth = new Date(y, m, 1);
      const lastDayOfMonth = new Date(y, m + 1, 0);
      const monthNum = m + 1;

      const monthWeeks: { week: number; range: number[] }[] = [];

      let current = new Date(firstDayOfMonth);
      current.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
      let weekCount = 1;

      while (true) {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekStart.getDate() + 6);

        if (weekStart > lastDayOfMonth && weekEnd > lastDayOfMonth) break;

        const weekDays: number[] = [];
        const d = new Date(weekStart);
        while (d <= weekEnd) {
          if (d.getMonth() === m) weekDays.push(d.getDate());
          d.setDate(d.getDate() + 1);
        }

        if (weekDays.length > 0) {
          monthWeeks.push({ week: weekCount, range: weekDays });
        }

        current.setDate(current.getDate() + 7);
        weekCount++;
      }

      result.push({ month: monthNum, weeks: monthWeeks });

      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
      if (y > end.getFullYear() || (y === end.getFullYear() && m > end.getMonth())) break;
    }

    const filtered = result.map((monthData) => {
      const validWeeks = monthData.weeks.filter((w) => {
        let year = start.getFullYear();
        if (monthData.month < start.getMonth() + 1 && end.getFullYear() > year) {
          year = end.getFullYear();
        }
        const weekStart = new Date(year, monthData.month - 1, w.range[0]);
        const weekEnd = new Date(year, monthData.month - 1, w.range[w.range.length - 1]);
        return weekEnd >= start && weekStart <= end;
      });
      return { month: monthData.month, weeks: validWeeks };
    });
    return filtered.filter((m) => m.weeks.length > 0);
  }

  static convertDateToCells(dateValue: string | null, weekHeaders: { month: number; weeks: { week: number; range: number[] }[] }[]) {
    const allCells: any[] = [];

    weekHeaders.forEach((m) =>
      m.weeks.forEach((w) =>
        allCells.push({
          month: m.month,
          week: w.week,
          text: '',
          active: false,
          colSpan: 1,
        }),
      ),
    );

    if (!dateValue) return allCells;

    const [startStr, endStr] = dateValue.includes('~') ? dateValue.split('~').map((s) => s.trim()) : [dateValue.trim(), dateValue.trim()];

    const start = new Date(startStr);
    const end = new Date(endStr);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const month = d.getMonth() + 1;
      const day = d.getDate();

      const monthData = weekHeaders.find((m) => m.month === month);
      if (!monthData) continue;

      const targetWeek = monthData.weeks.find((w) => w.range.includes(day));
      if (!targetWeek) continue;

      const cellIdx = allCells.findIndex((c) => c.month === month && c.week === targetWeek.week);

      if (cellIdx >= 0) {
        allCells[cellIdx].active = true;
        const existing = allCells[cellIdx].text;
        if (existing) {
          const nums = existing
            .split('~')
            .map((v) => parseInt(v))
            .concat(day)
            .sort((a, b) => a - b);
          allCells[cellIdx].text = nums[0] === nums[nums.length - 1] ? `${nums[0]}` : `${nums[0]}~${nums[nums.length - 1]}`;
        } else {
          allCells[cellIdx].text = `${day}`;
        }
      }
    }
    return this.mergeCells(allCells);
  }

  static mergeCells(cells: any[]) {
    const merged: any[] = [];
    let i = 0;

    while (i < cells.length) {
      const cell = cells[i];

      if (!cell.active) {
        merged.push(cell);
        i++;
        continue;
      }

      let span = 1;

      while (i + span < cells.length && cells[i + span].active) {
        span++;
      }

      const firstNums = cell.text ? cell.text.split('~').map((n) => parseInt(n)) : [];
      const lastNums = cells[i + span - 1].text ? cells[i + span - 1].text.split('~').map((n) => parseInt(n)) : [];
      const firstDay = firstNums[0];
      const lastDay = lastNums[lastNums.length - 1];

      const mergedText = firstDay === lastDay ? `${firstDay}` : `${firstDay}~${lastDay}`;

      merged.push({
        ...cell,
        text: mergedText,
        colSpan: span,
      });

      i += span;
    }
    return merged;
  }

  /**
   * templateItems drive the process taxonomy (group/name/types/order) instead of a hardcoded list.
   * planItems are the saved per-key date ranges (key = `${group}_${name}` or `${group}_${name}_${type}`).
   */
  static processes(
    templateItems: ProcessTemplateItem[],
    planItems: ProjectPlanItem[],
    weekHeaders: { month: number; weeks: { week: number; range: number[] }[] }[],
  ) {
    const planByKey = new Map(planItems.map((item) => [item.key, item]));
    const sorted = [...templateItems].sort((a, b) => a.order - b.order);

    const results: any[] = [];

    sorted.forEach((templateItem) => {
      const types = templateItem.types?.length ? templateItem.types : [null];

      types.forEach((type) => {
        const key = planItemKey(templateItem.group, templateItem.name, type);
        const planItem = planByKey.get(key);
        const dateValue = planItem?.startDate ? `${planItem.startDate}~${planItem.endDate ?? planItem.startDate}` : null;

        results.push({
          group: templateItem.group,
          name: templateItem.name,
          type,
          key,
          hasElectrode: templateItem.types?.length > 0,
          cells: this.convertDateToCells(dateValue, weekHeaders),
        });
      });
    });

    return results;
  }

  static transformPlanData(plan: any) {
    const weekHeaders = this.weekHeaders(plan.startDate, plan.endDate);
    const templateItems: ProcessTemplateItem[] = plan.template?.items ?? [];
    const planItems: ProjectPlanItem[] = plan.items ?? [];

    const processes = this.processes(templateItems, planItems, weekHeaders);

    const planData: Record<string, { start: string; end: string }> = {};
    planItems.forEach((item) => {
      planData[item.key] = { start: item.startDate, end: item.endDate };
    });

    return {
      id: plan.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
      project: plan.project,
      templateId: plan.template?.id ?? null,
      weekHeaders,
      processes,
      planData,
    };
  }
}
