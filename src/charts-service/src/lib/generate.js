const { CanvasRenderService } = require("chartjs-node-canvas");
const ChartDataLabels = require("chartjs-plugin-datalabels");
const Annotation = require("chartjs-plugin-annotation");
const axios = require("axios");

const PDFDocument = require("pdfkit");
const { Base64Encode } = require("base64-stream");

async function _images(shifts, groupCount) {
  try {
    const barWidth = 50;
    const maxShiftHours = 10.5;
    const unitsCount = shifts.map((shift) => shift.data[0]);
    const engineHours = shifts.map((shift) => shift.data[1]);
    const idlingHours = shifts.map((shift) => shift.data[2]);
    const motionHours = shifts.map((shift) =>
      (shift.data[1] - shift.data[2]).toFixed(2)
    );
    const idlingPercents = shifts.map((shift) => {
      const engine = shift.data[1];
      const idling = shift.data[1] - shift.data[2];
      return ((idling * 100) / engine).toFixed();
    });
    const averageFuel = shifts.map((shift) => shift.data[3]);
    const ecoRates = shifts.map((shift) => shift.data[4]);

    function setFont() {
      return shifts.map((shift, index) => {
        if (index === shifts.length - 1) return { weight: "bold" };
        else return {};
      });
    }
    function setLabelColor() {
      return shifts.map((shift, index) => {
        if (index === shifts.length - 1) return "black";
        else return "inherit";
      });
    }

    const width = 400;
    const height = 400;
    const chartCallback = (ChartJS) => {
      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      ChartJS.plugins.register({
        // plugin implementation
        ChartDataLabels,
        Annotation
      });
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      // ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
      // chart implementation
      // });
    };
    const canvasRenderService = new CanvasRenderService(
      width,
      height,
      chartCallback
    );

    const unitsConf = {
      plugins: [ChartDataLabels],
      type: "bar",
      data: {
        labels: shifts.map((shift) => shift.name),
        datasets: [
          {
            label: "Техника в работе, ед.",
            data: unitsCount,
            maxBarThickness: 35,
            backgroundColor: "rgba(85, 142, 213, .7)",
            borderColor: "rgba(85, 142, 213, 1)",
            borderWidth: "1",
            datalabels: {
              labels: {
                total: null,
                reserve: null
              }
            }
          },
          {
            label: "Техника в резерве, ед",
            data: unitsCount.map((value) => groupCount - value),
            maxBarThickness: 35,
            backgroundColor: "rgba(239, 242, 248, 1)",
            borderColor: "rgb(212, 212, 212)",
            borderWidth: "1",
            datalabels: {
              labels: {
                title: null
              }
            }
          }
        ]
      },
      options: {
        title: {
          display: true,
          padding: 20,
          text: ["Количество техники", "на линии в смену, ед."]
        },
        legend: {
          position: "bottom",
          align: "start",
          labels: {
            boxWidth: 10
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                drawBorder: false,
                color: "transparent",
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              drawTicks: false,
              gridLines: {
                drawBorder: true,
                color: "transparent",
                display: true
              },
              scaleLabel: {
                fontColor: "white"
              },
              ticks: {
                max: groupCount + groupCount * 0.2,
                display: false
              }
            }
          ]
        },
        plugins: {
          datalabels: {
            labels: {
              title: {
                color: "white",
                font: setFont(),
                align: "start",
                anchor: "start",
                offset: "5",
                formatter: function(value) {
                  const percentage = Math.round((value * 100) / groupCount);
                  const label = percentage
                    ? `${value}\n(${percentage}\n%)`
                    : null;
                  return label;
                }
              },

              reserve: {
                color: setLabelColor(),
                font: setFont(),
                align: "start",
                anchor: "start",
                offset: "5",
                formatter: function(value) {
                  const percentage = Math.round((value * 100) / groupCount);
                  const label = percentage ? percentage + "%" : null;
                  return label;
                }
              },

              total: {
                color: setLabelColor(),
                font: setFont(),
                anchor: "end",
                align: "top",
                offset: "5",
                formatter: () => groupCount
              }
            }
          }
        }
      }
    };
    const engineConf = {
      plugins: [ChartDataLabels, Annotation],
      type: "bar",
      data: {
        labels: shifts.map((shift) => shift.name),
        datasets: [
          {
            label: "Работа, час",
            data: engineHours,
            maxBarThickness: 35,
            backgroundColor: "rgba(115, 171, 55, 1)",
            borderColor: "rgb(114, 145, 83)",
            borderWidth: "1",
            datalabels: {
              labels: {
                value: null,
                idling: null
              }
            }
          },
          {
            label: "Простой, час",
            data: engineHours.map((value) =>
              (maxShiftHours - value).toFixed(2)
            ),
            maxBarThickness: 35,
            backgroundColor: "rgba(239, 242, 248, 1)",
            borderColor: "rgba(0, 0, 0, .2)",
            borderWidth: "1",
            datalabels: {
              labels: {
                title: null
              }
            }
          }
        ]
      },
      options: {
        title: {
          display: true,
          padding: 20,
          text: ["Среднее время работы парка,", "часов в смену"]
        },
        legend: {
          position: "bottom",
          align: "start",
          labels: {
            boxWidth: 10
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                drawBorder: false,
                color: "transparent",
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              drawTicks: false,
              gridLines: {
                drawBorder: true,
                color: "transparent",
                display: true
              },
              scaleLabel: {
                fontColor: "white"
              },
              ticks: {
                max: 12,
                display: false
              }
            }
          ]
        },
        plugins: {
          datalabels: {
            labels: {
              title: {
                color: "white",
                font: setFont(),
                align: "start",
                anchor: "start",
                offset: "5",
                formatter: function(value) {
                  const percentage = Math.round((value * 100) / maxShiftHours);
                  const label = percentage
                    ? `${value}\n(${percentage}\n%)`
                    : null;
                  return label;
                }
              },
              idling: {
                color: setLabelColor(),
                font: setFont(),
                align: "start",
                anchor: "start",
                offset: "5",
                formatter: function(value) {
                  const percentage = Math.round((value * 100) / maxShiftHours);
                  const label = percentage ? percentage + "%" : null;
                  return label;
                }
              },
              value: {
                anchor: "end",
                align: "top",
                offset: "5",
                color: setLabelColor(),
                font: setFont(),
                formatter: () => maxShiftHours
              }
            }
          }
        },
        annotation: {
          annotations: [
            {
              type: "line",
              // drawTime: "beforeDatasetsDraw",
              mode: "horizontal",
              scaleID: "y-axis-0",
              value: 10,
              borderColor: "black",
              borderWidth: 1,
              borderDash: [8, 2],
              label: {
                fontSize: 10,
                xPadding: 4,
                yPadding: 4,
                enabled: true,
                content: "10",
                position: "left",
                xAdjust: 0
              }
            }
          ]
        }
      }
    };
    const idlingConf = {
      plugins: [ChartDataLabels, Annotation],
      type: "bar",
      data: {
        labels: shifts.map((shift) => shift.name),
        datasets: [
          {
            label: "Холостая работа, час",
            data: idlingPercents,
            maxBarThickness: 35,
            backgroundColor: "rgba(238, 62, 53, 1)",
            borderColor: "rgba(0, 0, 0, .2)",
            borderWidth: "1",
            datalabels: {
              color: "white",
              labels: {
                engine: null,
                total: null
              }
            }
          },
          {
            label: "Движение, час",
            data: idlingPercents.map((value) => 100 - value),
            maxBarThickness: 35,
            backgroundColor: "rgba(239, 242, 248, 1)",
            borderColor: "rgba(0, 0, 0, .2)",
            borderWidth: "1",
            datalabels: {
              labels: {
                idling: null
              }
            }
          }
        ]
      },
      options: {
        title: {
          display: true,
          padding: 20,
          text: [
            "Средняя длительность работы",
            "на холостом ходу, часов в смену"
          ]
        },
        legend: {
          position: "bottom",
          align: "start",
          labels: {
            boxWidth: 10
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                drawBorder: false,
                color: "transparent",
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              drawTicks: false,
              gridLines: {
                drawBorder: true,
                color: "transparent",
                display: true
              },
              scaleLabel: {
                fontColor: "white"
              },
              ticks: {
                max: 110,
                display: false
              }
            }
          ]
        },
        plugins: {
          datalabels: {
            labels: {
              idling: {
                color: "white",
                align: "start",
                anchor: "start",
                offset: "5",
                font: setFont(),
                formatter(value, ctx) {
                  const hours = idlingHours[ctx.dataIndex];
                  return `${hours}\n(${idlingPercents[ctx.dataIndex]}\n%)`;
                },
                textAlign: "center"
              },
              engine: {
                align: "start",
                anchor: "start",
                offset: "5",
                color: setLabelColor(),
                font: setFont(),
                formatter: (value, ctx) => motionHours[ctx.dataIndex]
              },
              total: {
                color: setLabelColor(),
                font: setFont(),
                anchor: "end",
                align: "top",
                offset: "5",
                formatter: (value, ctx) =>
                  (
                    parseFloat(idlingHours[ctx.dataIndex]) +
                    parseFloat(motionHours[ctx.dataIndex])
                  ).toFixed(2)
              }
            }
          }
        },
        annotation: {
          annotations: [
            {
              type: "line",
              // drawTime: "beforeDatasetsDraw",
              mode: "horizontal",
              scaleID: "y-axis-0",
              value: 15,
              borderColor: "black",
              borderWidth: 1,
              borderDash: [8, 2],
              label: {
                fontSize: 10,
                xPadding: 4,
                yPadding: 4,
                enabled: true,
                content: "15%",
                position: "left",
                xAdjust: 0
              }
            }
          ]
        }
      }
    };
    const fuelConf = {
      plugins: [ChartDataLabels, Annotation],
      type: "bar",
      data: {
        labels: shifts.map((shift) => shift.name),
        datasets: [
          {
            label: "Средний расход топлива, литров в час",
            data: averageFuel,
            maxBarThickness: 35,
            backgroundColor: "rgba(0, 0, 0, .5)",
            borderColor: "rgba(0, 0, 0, .2)",
            borderWidth: "1"
          }
        ]
      },
      options: {
        title: {
          display: true,
          padding: 20,
          text: ["Средний расход топлива,", "литров в смену"]
        },
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                drawBorder: false,
                color: "transparent",
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              drawTicks: false,
              gridLines: {
                drawBorder: true,
                color: "transparent",
                display: true
              },
              scaleLabel: {
                fontColor: "white"
              },
              ticks: {
                max: Math.max.apply(null, averageFuel) + 10,
                display: false
              }
            }
          ]
        },
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            offset: "5",
            font: setFont(),
            color: setLabelColor(),
            formatter: (value) => value
          }
        },
        annotation: {
          annotations: [
            {
              type: "line",
              // drawTime: "beforeDatasetsDraw",
              mode: "horizontal",
              scaleID: "y-axis-0",
              value: 14,
              borderColor: "black",
              borderWidth: 1,
              borderDash: [8, 2],
              label: {
                fontSize: 10,
                xPadding: 4,
                yPadding: 4,
                enabled: true,
                content: "14",
                position: "left",
                xAdjust: 0
              }
            }
          ]
        }
      }
    };
    const ecoConf = {
      plugins: [ChartDataLabels, Annotation],
      type: "bar",
      data: {
        labels: shifts.map((shift) => shift.name),
        datasets: [
          {
            label: "Средняя оценка за вождение, баллов",
            data: ecoRates,
            maxBarThickness: 35,
            backgroundColor: "rgba(0, 0, 0, .5)",
            borderColor: "rgba(0, 0, 0, .2)",
            borderWidth: "1"
          }
        ]
      },
      options: {
        title: {
          display: true,
          padding: 20,
          text: ["Средняя оценка за вождение, баллов"]
        },
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              stacked: true,
              gridLines: {
                drawBorder: false,
                color: "transparent",
                display: false
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              drawTicks: false,
              gridLines: {
                drawBorder: true,
                color: "transparent",
                display: true
              },
              scaleLabel: {
                fontColor: "white"
              },
              ticks: {
                max: 5,
                display: false
              }
            }
          ]
        },
        plugins: {
          datalabels: {
            anchor: "end",
            align: "top",
            offset: "5",
            font: setFont(),
            color: setLabelColor(),
            formatter: (value) => value
          }
        },
        annotation: {
          annotations: [
            {
              type: "line",
              // drawTime: "beforeDatasetsDraw",
              mode: "horizontal",
              scaleID: "y-axis-0",
              value: 4.6,
              borderColor: "black",
              borderWidth: 1,
              borderDash: [8, 2],
              label: {
                fontSize: 10,
                xPadding: 4,
                yPadding: 4,
                enabled: true,
                content: "4,6",
                position: "left",
                xAdjust: 0
              }
            }
          ]
        }
      }
    };
    const units = await canvasRenderService.renderToBuffer(unitsConf);
    const engine = await canvasRenderService.renderToBuffer(engineConf);
    const idling = await canvasRenderService.renderToBuffer(idlingConf);
    const fuel = await canvasRenderService.renderToBuffer(fuelConf);
    const eco = await canvasRenderService.renderToBuffer(ecoConf);
    // const dataUrl = await canvasRenderService.renderToDataURL(configuration);
    // const stream = canvasRenderService.renderToStream(configuration);
    // console.log(dataUrl);

    return { units, engine, idling, fuel, eco };
  } catch (e) {
    console.log(e);
  }
}

async function _pdf(shifts, groupCount, data) {
  return new Promise(async (resolve, reject) => {
    var doc = new PDFDocument();
    let x = 30;
    let y = 30;

    async function regFont(url, name) {
      const res = await axios.get(url, {
        responseType: "arraybuffer"
      });
      const font = Buffer.from(res.data, "base64");
      doc.registerFont(name, font);
    }

    await regFont(
      "https://dm112.gitlab.io/wialon-charts/fonts/NotoSans-Regular.ttf",
      "Regular"
    );

    await regFont(
      "https://dm112.gitlab.io/wialon-charts/fonts/NotoSans-Bold.ttf",
      "Bold"
    );

    // write to PDF

    doc
      .font("Bold")
      .fontSize(20)
      .fillColor("#1954a5")
      .text("Ежедневный отчет Wialon Charts", x, y, {
        align: "center"
      })
      .fillColor("black");
    doc.moveDown();

    doc
      .fontSize(10)
      .font("Bold")
      .text(`Хост: `, { continued: true })
      .font("Regular")
      .text(data.host);

    doc
      .fontSize(10)
      .font("Bold")
      .text(`Аккаунт Wialon: `, { continued: true })
      .font("Regular")
      .text(data.username);

    doc
      .fontSize(10)
      .font("Bold")
      .text(`Группа техники: `, { continued: true })
      .font("Regular")
      .text(data.groupName);

    doc
      .fontSize(10)
      .font("Bold")
      .text(`Часовой пояс пользователя Wialon: `, { continued: true })
      .font("Regular")
      .text(`GMT${data.serverTimeZone}`);

    doc
      .fontSize(10)
      .font("Bold")
      .text(`Период: `, { continued: true })
      .font("Regular")
      .text(data.period);

    y = y + 160;

    const { units, engine, idling, fuel, eco } = await _images(
      shifts,
      groupCount
    );
    doc.image(units, x, y, { width: 250, height: 250 });
    doc.image(engine, x + 280, y, { width: 250, height: 250 });
    y = y + 280;
    doc.image(idling, x, y, { width: 250, height: 250 });
    doc.image(fuel, x + 280, y, { width: 250, height: 250 });

    doc.addPage();
    doc.image(eco, 170, 30, { width: 250, height: 250 });

    var finalString = ""; // contains the base64 string
    var stream = doc.pipe(new Base64Encode());

    doc.end(); // will trigger the stream to end

    stream.on("data", function(chunk) {
      finalString += chunk;
    });

    stream.on("finish", function() {
      // the stream is at its end, so push the resulting base64 string to the response
      // console.log(finalString);
      resolve(finalString);
    });
  });
}

module.exports = {
  _pdf
};
