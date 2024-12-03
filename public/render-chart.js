const colorMap = new Map();

const memoizedGetRandomColor = (() => {
  const colorCache = new Map();
  return (key) => {
    if (!colorCache.has(key)) {
      colorCache.set(
        key,
        '#' +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padEnd(6, '0'),
      );
    }
    return colorCache.get(key);
  };
})();

export function renderGanttChart(data) {
  if (data.error) throw new Error(data.message);

  const day = 24 * 36e5;
  const today = Math.floor(Date.now() / day) * day;

  // Pre-generate colors for users
  if (data.users) {
    data.users.forEach((user) =>
      colorMap.set(user.login, memoizedGetRandomColor(user.login)),
    );
  }

  // Prepare series data more efficiently
  const seriesData = [];

  data.milestones.forEach(function (milestone) {
    seriesData.push({
      name: milestone.name,
      id: milestone.unique_id,
      color: '#046481',
      total_estimate:
        Array.isArray(data.total_estimate) && data.total_estimate.length !== 0
          ? data?.total_estimate[milestone?.unique_id]
          : '',
      total_spent:
        Array.isArray(data.total_spent) && data.total_spent.length !== 0
          ? data?.total_spent[milestone?.unique_id]
          : '',
      start: milestone.start_date ?? new Date().getTime(),
      end: milestone.end_date ?? new Date().getTime(),
      collapsed: true,
    });

    const tasks = Array.isArray(milestone.tasks)
      ? milestone.tasks
      : Object.values(milestone.tasks);

    seriesData.push(
      ...tasks.map((task) => ({
        name: `<a style="
            color:${
              task.timelog_not_found
                ? '#e37500'
                : task.issue_completed
                  ? 'red'
                  : 'reset'
            };
            text-decoration: ${task.timelog_null ? 'line-through' : 'reset'}; "
            href="${task.task_web_url}" target="_blank">${task.title}</a>`,
        full_title: task.full_title,
        project_name: task.project_name,
        id: task.parent ? null : task.id,
        parent: task.parent,
        dependency: task.dependency,
        start: task.start_date ?? new Date().getTime(),
        end: task.end_date ?? new Date().getTime(),
        human_estimate: task.human_estimate,
        completed: {
          amount: task.percentage_spent,
        },
        tracked_time: task.tracked_time,
        owner: task.assignee.name,
        owner_value: task.assignee.login,
        avatar_url: task.assignee.avatarUrl,
        task_web_url: task.task_web_url,
        color: colorMap.get(task.assignee.login),
        issue_completed: task.issue_completed,
      })),
    );
  });

  const options = {
    chart: {
      plotBackgroundColor: 'rgba(128,128,128,0.02)',
      plotBorderColor: 'rgba(128,128,128,0.1)',
      plotBorderWidth: 1,
    },
    boost: {
      useGPUTranslations: true,
      usePreAllocated: true,
      seriesThreshold: 1,
    },
    plotOptions: {
      series: {
        animation: false,
        enableMouseTracking: true, // Enabled for tooltip
        shadow: false,
        dataLabels: [
          {
            enabled: true,
            align: 'left',
            format: '{point.name}',
            padding: 20,
            style: {
              fontWeight: 'normal',
            },
          },
          {
            useHTML: true,
            enabled: true,
            align: 'left',
            x: -40,
            y: 0,
            formatter: function () {
              if (this.point?.avatar_url) {
                return (
                  '<img src="https://studiopresent.myjetbrains.com' +
                  this.point.avatar_url +
                  '" style="width: 24px; height: 24px; border-radius: 12px; margin-top:4px; z-index: -1000;" />'
                );
              }
            },
          },
        ],
      },
    },
    tooltip: {
      backgroundColor: null,
      borderWidth: 0,
      shadow: false,
      useHTML: true,
      style: {
        padding: 0,
      },
      pointFormat:
        '<span style="font-weight: bold">{point.full_title}</span>' +
        '{#if point.project_name} - <span>{point.project_name}</span><br>{/if}' +
        '{point.start:%e %b}' +
        '→ {point.end:%e %b}' +
        '<br>' +
        '{#if point.completed}' +
        'Completed: {multiply point.completed.amount 100}%<br>' +
        '{/if}' +
        '{#if point.human_estimate}' +
        'Estimate / Tracked time: {point.human_estimate}<br>' +
        '{/if}' +
        '{#if point.tracked_time}' +
        ' / {point.tracked_time}' +
        '<br>{/if}' +
        '{#if point.owner}' +
        'Assignee: {point.owner}' +
        '<br>{/if}',
    },
    navigator: {
      enabled: true,
      liveRedraw: false,
      series: {
        type: 'gantt',
        pointPlacement: 0.5,
        pointPadding: 0.25,
        accessibility: {
          enabled: false,
        },
        dataGrouping: {
          smoothed: true,
        },
        lineWidth: 1,
        marker: {
          enabled: false,
        },
      },
      yAxis: {
        // min: 0,
        // max: 0,
        reversed: true,
        categories: [],
      },
    },
    scrollbar: {
      enabled: true,
    },
    rangeSelector: {
      enabled: true,
      selected: 1,
    },
    xAxis: {
      currentDateIndicator: {
        color: '#ff0000',
        dashStyle: 'Solid',
        width: 4,
        label: {
          format: '',
        },
      },
      dateTimeLabelFormats: {
        day: '%e<br><span style="opacity: 0.5; font-size: 0.7em">%a</span>',
      },
      grid: {
        borderWidth: 0,
      },
      gridLineWidth: 2,
      custom: {
        today,
        weekendPlotBands: true,
      },
    },
    yAxis: {
      uniqueNames: true,
      grid: {
        borderColor: 'rgba(128,128,128,0.2)',
        columns: [
          {
            title: {
              text: 'Task',
            },
          },
          {
            title: {
              text: 'Est. / Spe.',
            },
            labels: {
              formatter: function (ctx) {
                if (ctx.point?.total_estimate || ctx.point?.total_spent) {
                  return (
                    ctx.point?.total_estimate + '</br>' + ctx.point?.total_spent
                  );
                }
                if (ctx.point?.human_estimate) {
                  return (
                    ctx.point?.human_estimate +
                    '</br>' +
                    ctx.point?.tracked_time
                  );
                }
              },
              useHTML: true,
            },
          },
        ],
      },
      gridLineWidth: 0,
      custom: {
        weekendPlotBands: true,
      },
      staticScale: 40,
    },
    time: {
      useUTC: true,
      timezone: 'Europe/Belgrade',
    },
    series: [
      {
        name: 'SP',
        data: seriesData,
      },
    ],
  };

  // Plug-in to render plot bands for the weekends
  Highcharts.addEvent(Highcharts.Axis, 'foundExtremes', (e) => {
    if (e.target.options.custom && e.target.options.custom.weekendPlotBands) {
      const axis = e.target,
        chart = axis.chart,
        day = 24 * 36e5,
        isWeekend = (t) => /[06]/.test(chart.time.dateFormat('%w', t)),
        plotBands = [];

      let inWeekend = false;

      for (
        let x = Math.floor(axis.min / day) * day;
        x <= Math.ceil(axis.max / day) * day;
        x += day
      ) {
        const last = plotBands.at(-1);
        if (isWeekend(x) && !inWeekend) {
          plotBands.push({
            from: x,
            color: 'rgba(0,0,0,0.05)',
          });
          inWeekend = true;
        }

        if (!isWeekend(x) && inWeekend && last) {
          last.to = x;
          inWeekend = false;
        }
      }
      axis.options.plotBands = plotBands;
    }
  });

  Highcharts.ganttChart('chart', options);

  let user_series = {
    name: '',
    data: [],
  };

  for (const [user_key, user] of Object.entries(data.time_allocation)) {
    for (const [date_key, completed] of Object.entries(user)) {
      // Split the date string to extract year, month, and day
      let parts = date_key.split('-');
      let year = parseInt(parts[0]);
      let month = parseInt(parts[1]) - 1; // Month is zero-based in JavaScript
      let day = parseInt(parts[2]);

      const maxValue = 86400;

      const currentDate = new Date();
      const taskDate = new Date(date_key);

      let percentage = (completed / maxValue) * 100;

      if (taskDate.getTime() >= currentDate.getTime()) {
        percentage = 0;
      }

      const date = new Date(completed * 1000); // Convert seconds to milliseconds
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();

      const userDataEntry = {
        start: Date.UTC(year, month, day),
        end: Date.UTC(year, month, day + 1),
        completed: {
          amount: percentage,
        },
        time: hours + 'h' + '<br>' + minutes + 'm',
        name: user_key,
        color: colorMap.get(user_key),
      };

      user_series.data.push(userDataEntry);
    }
  }

  // Get the window width
  const windowWidth = window.innerWidth;

  // Calculate 30% of the window width
  const percentageWidth = windowWidth * 0.82;

  // Subtract the 30% from the original window width
  const resultWidth = windowWidth - percentageWidth;

  const user_options = {
    title: {
      text: 'Team workloads (estimated hours)',
    },
    xAxis: {
      currentDateIndicator: {
        color: '#ff0000',
        dashStyle: 'Solid',
        width: 4,
        label: {
          format: '',
        },
      },
      grid: {
        borderWidth: 0,
      },
      // min: today - data.calendar_start_time * day, // X days in past. Depending on earliest milestone start date.
      // max: today + data.calendar_end_time * day, // 4 days in future.
      gridLineWidth: 2,
      custom: {
        today,
        weekendPlotBands: true,
      },
    },
    yAxis: {
      gridLineWidth: 2,
      uniqueNames: true,
    },

    chart: {
      type: 'gantt',
      marginLeft: resultWidth,
    },

    plotOptions: {
      series: {
        dataLabels: [
          {
            enabled: false,
            style: {
              width: '300',
            },
          },
          {
            enabled: true,
            align: 'center',
            format: '{point.time}',
            style: {
              fontWeight: 'normal',
              opacity: 1,
              fontSize: '12px',
            },
          },
        ],
      },
    },

    navigator: {
      enabled: true,
      liveRedraw: true,
      series: {
        type: 'gantt',
        pointPlacement: 0.5,
        pointPadding: 0.25,
        accessibility: {
          enabled: false,
        },
        dataGrouping: {
          smoothed: true,
        },
        lineWidth: 1,
        marker: {
          enabled: false,
        },
      },
      yAxis: {
        min: 0,
        max: 3,
        reversed: true,
        categories: [],
      },
    },
    scrollbar: {
      enabled: true,
    },
    rangeSelector: {
      enabled: true,
      selected: 1,
    },

    series: [user_series],
  };

  Highcharts.ganttChart('user-table-container', user_options);
}
