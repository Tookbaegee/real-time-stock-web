
let stocks = []

let refreshing = false


async function addStock(){
    
    let list = document.getElementById("list_stock")
    let newStock = document.getElementById("tf_input_stock").value.toUpperCase()
    //duplicate stock check. nothing happens if the stock name entered already exists in the stocks list
    let dup = false
    stocks.forEach(stock => {
        if(newStock === stock.name){
            dup = true
        }
    })
    //error message show/hide
    let dupErrMsg = document.getElementById("dupErrMsg")
    let errMsg = document.getElementById("ErrMsg")
    if(dup){
        dupErrMsg.classList.remove("hidden")
    }else{
        dupErrMsg.classList.add("hidden")

        const stockPrice = await getStockPrice(newStock)
        //if price retrieved is -1, the api failed to find a price for the stock name.
        //display invalid stock message.
        if(stockPrice.price != -1){
            
            //if not -1, add stock to stocks, update the stock prices immediately, and render chart
            errMsg.classList.add("hidden")
            let li = document.createElement("li")
            let text = document.createTextNode(newStock)
            li.appendChild(text)
            list.appendChild(li)
            stocks.push({name: newStock, value: stockPrice.price})
            
            //prevents multiple autoupdate calls. (triggers and stacks the autoupdate in between the 5 second interval)
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
    //instantiate new dataview from data to for price annotation 
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

    // Instantiate and draw our chart
    var chart = new google.visualization.BarChart(document.getElementById("chart_div"))
    chart.draw(view, options)
}

//single stock price retrieval. Endpoint reaches the "getStockPrice" function in routes.py. negative price is returned if reponse returns error.
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

//batch stock prices retrieval. Endpoint reaches the "getStockBatchPrice" function in routes.py. Updates the stocks from the response.
//triggers auto update.
async function autoUpdateStockPrices(){

    //API takes the stock names separated by commas as the input. trailing comma is ignored.
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
            //update stock prices from retrieved dictionary that contains prices for each stock
            for(var key in updatedStocks){
                for(var i = 0; i < stocks.length; i++){
                    if(stocks[i].name == key){
                        stocks[i].value = updatedStocks[key].price
                    }
                }
            }

            //re-render chart after the update
            drawChart()

            //recursive call with 5000 ms delay. (refreshes the list every five second)
            setTimeout(autoUpdateStockPrices, 5000) 
            
        }
    } 
}

//batch stock prices retrieval. Endpoint reaches the "getStockBatchPrice" function in routes.py. Updates the stocks from the response.
//no recursive calls. (single use)
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

