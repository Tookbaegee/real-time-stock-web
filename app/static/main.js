
let stocks = []
let refreshing = false

async function addStock(){
    
    let list = document.getElementById("list_stock")
    let newStock = document.getElementById("tf_input_stock").value.toUpperCase()
    let dup = false
    stocks.forEach(stock => {
        if(newStock === stock.name){
            dup = true
        }
    })
    let dupErrMsg = document.getElementById("dupErrMsg")
    let errMsg = document.getElementById("ErrMsg")
    if(dup){
        dupErrMsg.classList.remove("hidden")
    }else{
        dupErrMsg.classList.add("hidden")

        const stockPrice = await getStockPrice(newStock)

        if(stockPrice.price != -1){
            errMsg.classList.add("hidden")
            let li = document.createElement("li")
            let text = document.createTextNode(newStock)
            li.appendChild(text)
            list.appendChild(li)
            stocks.push({name: newStock, value: stockPrice.price})
            if(refreshing){
                updateStockPrices()
            }
            else{
                refreshing = true
                autoUpdateStockPrices()
            }
        }else{
            errMsg.classList.remove("hidden")
        }
    }
}

function drawChart() {

    // Create the data table.
    var stockArray = []
    stockArray.push(["Stock", "Price"])
    stocks.forEach(stock => {
        stockArray.push([stock.name, stock.value])
    })
    var data = google.visualization.arrayToDataTable(stockArray)
    var view = new google.visualization.DataView(data)
    view.setColumns([0, 1, {calc: "stringify", sourceColumn: 1, type: "string", role: "annotation"}])
    // Set chart options
    var options = {"title":"Stock Prices",
                   "chartArea":{width: "50%"},
                    hAxis: {
                        title: "Price", 
                        minValue: 0
                    },
                    legend:{
                        position: "none"
                    }
                }

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById("chart_div"))
    chart.draw(view, options)
}

async function getStockPrice(stockName){
    let url = window.origin + "/stockPrice/" + stockName
    const r = await fetch(url)
    if(r.ok == false){
        console.error("something went wrong while reaching the server. :(")
    }
    else if(r.clone().json().error != null){
        console.error("server encountered error while retrieving stock information.")
        console.error(r.clone.json().error)
        
    }
    
    return r.ok ? r.json() : {"price": -1}
     
}

async function autoUpdateStockPrices(){

    let stockNames = ""
    if(stocks.length){
        stocks.forEach((stock) => {
            stockNames += stock.name + ","
        })
        
        let url = window.origin + "/stockBatchPrice/" + stockNames
        const r = await fetch(url)
        const updatedStocks = await r.json()
        
        if(r.ok == false){
            console.error("something went wrong while reaching the server. :(")
        }
        else if(Object.keys(updatedStocks)[0] == "error"){
            console.error("server encountered error while retrieving stock information.")
            console.error(updatedStocks.error)
        }
        else{
            for(var key in updatedStocks){
                for(var i = 0; i < stocks.length; i++){
                    if(stocks[i].name == key){
                        stocks[i].value = updatedStocks[key].price
                    }
                }
            }
            drawChart()

            setTimeout(autoUpdateStockPrices, 5000)
            
        }
    } 
}

async function updateStockPrices(){

    let stockNames = ""
    if(stocks.length){
        stocks.forEach((stock) => {
            stockNames += stock.name + ","
        })
        
        let url = window.origin + "/stockBatchPrice/" + stockNames
        const r = await fetch(url)
        const updatedStocks = await r.json()
        
        if(r.ok == false){
            console.error("something went wrong while reaching the server. :(")
        }
        else if(Object.keys(updatedStocks)[0] == "error"){
            console.error("server encountered error while retrieving stock information.")
            console.error(updatedStocks.error)
        }
        else{
            for(var key in updatedStocks){
                for(var i = 0; i < stocks.length; i++){
                    if(stocks[i].name == key){
                        stocks[i].value = updatedStocks[key].price
                    }
                }
            }
            drawChart()
        }
    } 
}

