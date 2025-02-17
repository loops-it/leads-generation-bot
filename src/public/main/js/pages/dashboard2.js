//[Dashboard Javascript]

//Project:	Chat Bot Admin - Dashboard
//Primary use:   Used only for the main dashboard (index.html)


$(function () {
	// Apex chart2 end
	
	
	var options = {
        series: [{
          name: 'PRODUCTIVITY',
          data: [5, 6, 8, 2, 5, 7, 9]
        }],
        chart: {
          type: 'bar',
          height: 198
        },
		colors:['#2444e8'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '40%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
		grid: {
			show: false,  
		},
        stroke: {
          show: false,
          width: 0,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        },
		
        yaxis: {
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false,
          },
          labels: {
            show: false,
          }
        
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " Hours"
            }
          }
        }
      };

      var chart = new ApexCharts(document.querySelector("#profit"), options);
      chart.render();
		
}); // End of use strict
