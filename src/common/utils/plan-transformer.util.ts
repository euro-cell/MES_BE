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
        const weekStart = new Date(start.getFullYear(), monthData.month - 1, w.range[0]);
        const weekEnd = new Date(start.getFullYear(), monthData.month - 1, w.range[w.range.length - 1]);
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
      let days: number[] = [];
      let startIdx = i;

      while (i + span < cells.length && cells[i + span].active) {
        const nextText = cells[i + span].text;
        const currentNums = nextText ? nextText.split('~').map((n) => parseInt(n)) : [];
        days = days.concat(currentNums);
        span++;
      }

      const currentNums = cell.text ? cell.text.split('~').map((n) => parseInt(n)) : [];
      days = days.concat(currentNums).sort((a, b) => a - b);

      const mergedText = days.length === 1 ? `${days[0]}` : `${days[0]}~${days[days.length - 1]}`;

      merged.push({
        ...cell,
        text: mergedText,
        colSpan: span,
      });

      i += span;
    }
    return merged;
  }

  static processes(processData: Record<string, string>, weekHeaders: { month: number; weeks: { week: number; range: number[] }[] }[]) {
    const processList = [
      {
        group: 'Electrode',
        items: [
          { name: 'Slurry Mixing', types: ['Cathode', 'Anode'], fields: ['mixingCathode', 'mixingAnode'] },
          { name: 'Coating', types: ['Cathode', 'Anode'], fields: ['coatingCathode', 'coatingAnode'] },
          { name: 'Calendering', types: ['Cathode', 'Anode'], fields: ['calenderingCathode', 'calenderingAnode'] },
          { name: 'Notching', types: ['Cathode', 'Anode'], fields: ['notchingCathode', 'notchingAnode'] },
        ],
      },
      {
        group: 'Cell Assembly',
        items: [
          { name: 'Pouch Forming', types: [], fields: ['pouchForming'] },
          { name: 'Vacuum Drying', types: ['Cathode', 'Anode'], fields: ['vacuumDryingCathode', 'vacuumDryingAnode'] },
          { name: 'Stacking', types: [], fields: ['stacking'] },
          { name: 'Tab Welding', types: [], fields: ['tabWelding'] },
          { name: 'Sealing', types: [], fields: ['sealing'] },
          { name: 'E/L Filling', types: [], fields: ['elFilling'] },
        ],
      },
      {
        group: 'Cell Formation',
        items: [
          { name: 'PF/MF', types: [], fields: ['pfMf'] },
          { name: 'Grading', types: [], fields: ['grading'] },
        ],
      },
    ];

    const results: any[] = [];

    processList.forEach((group) => {
      group.items.forEach((item) => {
        if (item.types.length === 0) {
          const field = item.fields[0];
          results.push({
            group: group.group,
            name: item.name,
            type: null,
            key: `${group.group}_${item.name}`,
            hasElectrode: false,
            cells: this.convertDateToCells(processData[field], weekHeaders),
          });
        } else {
          item.types.forEach((type, idx) => {
            const field = item.fields[idx];
            results.push({
              group: group.group,
              name: item.name,
              type,
              key: `${group.group}_${item.name}_${type}`,
              hasElectrode: true,
              cells: this.convertDateToCells(processData[field], weekHeaders),
            });
          });
        }
      });
    });
    return results;
  }

  static transformPlanData(plan: any) {
    const weekHeaders = this.weekHeaders(plan.startDate, plan.endDate);

    const processKeys = [
      'mixingCathode',
      'mixingAnode',
      'coatingCathode',
      'coatingAnode',
      'calenderingCathode',
      'calenderingAnode',
      'notchingCathode',
      'notchingAnode',
      'pouchForming',
      'vacuumDryingCathode',
      'vacuumDryingAnode',
      'stacking',
      'tabWelding',
      'sealing',
      'elFilling',
      'pfMf',
      'grading',
    ];

    const processData = Object.fromEntries(Object.entries(plan).filter(([key]) => processKeys.includes(key))) as Record<string, string>;

    const processes = this.processes(processData, weekHeaders);

    return {
      id: plan.id,
      startDate: plan.startDate,
      endDate: plan.endDate,
      production: plan.production,
      weekHeaders,
      processes,
      planData: processData,
    };
  }
}
