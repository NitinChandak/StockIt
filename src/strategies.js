import React from 'react'
export const strategies = () => {
    var pricechart = JSON.parse(localStorage.getItem('pricechart'));
    var macdArray = JSON.parse(localStorage.getItem('macdArray'));
    var bbandArray = JSON.parse(localStorage.getItem('bbandArray'));
    var atrArray = JSON.parse(localStorage.getItem('atrArray'));
    var adxArray = JSON.parse(localStorage.getItem('adxArray'));

    // console.log("macdArray: ", macdArray);
    // console.log("bbandArray: ", bbandArray);
    // console.log("atrArray: ", atrArray);
    // console.log("adxArray: ", adxArray);
    
    // console.log("price chart:", pricechart)
    pricechart.reverse();
    macdArray.reverse();
    bbandArray.reverse();
    atrArray.reverse();
    adxArray.reverse();
    var current_price = pricechart[0];
    function calculateSMA(timeperiod, start) {
        var total = 0;
        var chartLen = pricechart.length;
        var deno = (chartLen < timeperiod)?chartLen : timeperiod;
        for(var i = start; i < deno+start; i++) {
            total += pricechart[i];
        }
        var avg = total / deno;
        return avg;
        
    }

    function calculateEMA(timeperiod) {
        const k = 2 / (timeperiod + 1);
        let ema = pricechart[0];
        for (let i = 1; i < pricechart.length; i++) {
        ema = (pricechart[i] * k) + (ema * (1 - k));
        }
    
        return ema;
    }

    function calculateRSI() {
        let closingPrices = pricechart;
        let rsiLength = 15;
        let avgUpwardChange = 0;
        for (let i = 1; i < rsiLength; i++) {
        avgUpwardChange += Math.max(0, closingPrices[i] - closingPrices[i - 1]);
        }
        avgUpwardChange /= rsiLength;
    
        let avgDownwardChange = 0;
        for (let i = 1; i < rsiLength; i++) {
        avgDownwardChange += Math.max(0, closingPrices[i - 1] - closingPrices[i]);
        }
        avgDownwardChange /= rsiLength;
    
        const rsi = 100 - (100 / (1 + (avgUpwardChange / avgDownwardChange)));
        return rsi;
    }

    function getMACDvalue() {
        return macdArray;
    }

    function getMACDtrend() {
        if(macdArray[0]['MACD'] > macdArray[0]['MACDSig'])
            return 1;
        if(macdArray[0]['MACD'] < macdArray[0]['MACDSig'])
            return 0;
        return 2;
    }

    function getBBandsValue() {

        return bbandArray;
    }

    function getADXRvalue() {

        // var adxrArray = adxArray.map(Number);
        // console.log("ADXR 0", adxArray[0]['ADXR'])
        return parseFloat(adxArray[0]['ADXR']);

    }

    function getATRvalue() {
        return atrArray;
    }

    function RSI_and_BBands() {

        var latest200DaySMA = calculateSMA(200,0);

        var bollingerSentiment = 0;
        var bollingerRange = 30;
        var bollingerBands = getBBandsValue()
        var latestLowerLevel = bollingerBands[0]['Real Lower Band'];
        var latestMidLevel = bollingerBands[0]['Real Middle Band'];
        var latestUpperLevel = bollingerBands[0]['Real Upper Band'];

        if(current_price <= latestLowerLevel)
            bollingerSentiment = bollingerRange;
        else if(current_price >= latestUpperLevel)
            bollingerSentiment = -bollingerRange;
        else if(current_price == latestMidLevel)
            bollingerSentiment = 0;
        else if ((current_price > latestMidLevel) && (latestUpperLevel != latestMidLevel))
            bollingerSentiment = bollingerRange*((current_price - latestMidLevel)/(latestUpperLevel - latest200DaySMA));
        else if (latestLowerLevel != latestMidLevel)
            bollingerSentiment = -bollingerRange*((current_price - latestMidLevel)/(latestLowerLevel - latest200DaySMA));


        var rsiSentiment = 0;
        var rsi = calculateRSI(pricechart);

        if(rsi <= 30 && rsi >= 25)
            rsiSentiment = 50;
        else if(rsi <= 25  &&  rsi >= 20)
            rsiSentiment = 55;
        else if(rsi <= 20 && rsi >= 15)
            rsiSentiment = 60;
        else if(rsi <= 15 && rsi >= 10)
            rsiSentiment = 65;
        else if(rsi <= 10)
            rsiSentiment = 70;
        else if(rsi <= 75 && rsi >= 70)
            rsiSentiment = -50;
        else if(rsi <= 80 && rsi >= 75)
            rsiSentiment = -55;
        else if(rsi <= 85 && rsi >= 80)
            rsiSentiment = -60;
        else if(rsi <= 90 && rsi >= 85)
            rsiSentiment = -65;
        else if(rsi >= 90)
            rsiSentiment = -70;
        else
            rsiSentiment = -1 * (2.5*(rsi-30) - 50);

        var finalSentiment = bollingerSentiment + rsiSentiment;
        return finalSentiment;
    }


    function RSI_and_MACD() {

        var macdRange = 30;
        var macdSentiment = 0;

        var macdValues = getMACDvalue();
        var macdLineValue = macdValues[0]['MACD'];
        var signalLineValue = macdValues[0]['MACDSig'];
        var previousMACDLineValue = macdValues[1]['MACD'];
        var previousSignalLineValue = macdValues[1]['MACDSig'];

        if (macdLineValue > signalLineValue*1.05)
            macdSentiment = macdRange;
        else if (macdLineValue < signalLineValue*0.95)
            macdSentiment = -macdRange;
        // incase of crossing line, strong trend reversal 
        else{
            if (previousMACDLineValue > previousSignalLineValue)
                macdSentiment = -macdRange;
            else
                macdSentiment = macdRange;
        }

        var rsiSentiment = 0;
        var rsi = calculateRSI(pricechart);

        if(rsi <= 30 && rsi >= 25)
            rsiSentiment = 45;
        else if(rsi <= 25  &&  rsi >= 20)
            rsiSentiment = 50;
        else if(rsi <= 20 && rsi >= 15)
            rsiSentiment = 60;
        else if(rsi <= 15 && rsi >= 10)
            rsiSentiment = 65;
        else if(rsi <= 10)
            rsiSentiment = 70;
        else if(rsi <= 75 && rsi >= 70)
            rsiSentiment = -45;
        else if(rsi <= 80 && rsi >= 75)
            rsiSentiment = -50;
        else if(rsi <= 85 && rsi >= 80)
            rsiSentiment = -60;
        else if(rsi <= 90 && rsi >= 85)
            rsiSentiment = -65;
        else if(rsi >= 90)
            rsiSentiment = -70;
        else
            rsiSentiment = -1 * (2.25*(rsi-30) - 50);

        var finalSentiment = macdSentiment + rsiSentiment;
        return finalSentiment;
    }

    function MACD_and_BollingerBands() {
        var bollingerSentiment = 0;
        var bollingerRange = 50;
        var bollingerBands = getBBandsValue()
        var latestLowerLevel = bollingerBands[0]['Real Lower Band'];
        var latestMidLevel = bollingerBands[0]['Real Middle Band'];
        var latestUpperLevel = bollingerBands[0]['Real Upper Band'];
        var latest200DaySMA = calculateSMA(200,0);

        if(current_price <= latestLowerLevel)
            bollingerSentiment = bollingerRange;
        else if(current_price >= latestUpperLevel)
            bollingerSentiment = -bollingerRange;
        else if(current_price == latestMidLevel)
            bollingerSentiment = 0;
        else if ((current_price > latestMidLevel) && (latestUpperLevel != latestMidLevel))
            bollingerSentiment = bollingerRange*((current_price - latestMidLevel)/(latestUpperLevel - latest200DaySMA));
        else if (latestLowerLevel != latestMidLevel)
            bollingerSentiment = -bollingerRange*((current_price - latestMidLevel)/(latestLowerLevel - latest200DaySMA));

        


            var macdRange = 50;
            var macdSentiment = 0;
        
            var macdValues = getMACDvalue();
            var macdLineValue = macdValues[0]['MACD'];
            var signalLineValue = macdValues[0]['MACDSig'];
            var previousMACDLineValue = macdValues[1]['MACD'];
            var previousSignalLineValue = macdValues[1]['MACDSig'];
        
            if (macdLineValue > signalLineValue)
                macdSentiment = macdRange;
            else if (macdLineValue < signalLineValue)
                macdSentiment = -macdRange;
            // incase of crossing line, strong trend reversal 
            else if (macdLineValue == signalLineValue) {
                if (previousMACDLineValue > previousSignalLineValue)
                    macdSentiment = -macdRange;
                else
                    macdSentiment = macdRange;
            }


        var finalSentiment = macdSentiment + bollingerSentiment;
        return finalSentiment;

    }


    function ADX_and_RSI() {
        var rsi = calculateRSI();
        var adxr = getADXRvalue();

        var result = 0;
        if(rsi<20)
        result=10;
        else if(rsi>80)
        result = -10;
        else {
            result = 10-1/3*(rsi-20);
        }
        var scale = adxr/75;
        if (scale > 1)
        scale = -1;
        result = 10*result*scale;
        return result;
    }


    function ATR_and_SMA() {
        var atr_values = getATRvalue();
        var min_atr = -1000;
        var max_atr = 1000;

        for(var i=0;i<14; i++)
        {
            min_atr = Math.min(min_atr, atr_values[i]);
            max_atr = Math.max(min_atr, atr_values[i]);
        }

        var current_atr = atr_values[0];
        var current_difference_from_lowest = current_atr - min_atr;
        var max_difference = max_atr - min_atr;
        
        var atr_sentiment = (current_difference_from_lowest/max_difference) * 5;
        var atr_result = 5;
        if (atr_sentiment <= 0.5)
            atr_result = 100;
        else if (atr_sentiment <= 1)
            atr_result = 80;
        else
            atr_result = 0;


        var SMA20_1 = calculateSMA(20,0);
        var SMA20_2 = calculateSMA(20,19);

        if(SMA20_1 < SMA20_2)
        atr_result = atr_result*(-1);

        return atr_result;

    }
    const atr_sma = ATR_and_SMA()
    const adx_rsi = ADX_and_RSI()
    const macd_bbands = MACD_and_BollingerBands()
    const rsi_macd = RSI_and_MACD()
    const rsi_bbands = RSI_and_BBands()

    console.log(atr_sma,adx_rsi,macd_bbands,rsi_macd,rsi_bbands)

    var finalResult = (ATR_and_SMA() + ADX_and_RSI() + MACD_and_BollingerBands() + RSI_and_MACD() + RSI_and_BBands())/5;
    finalResult = (finalResult+100)*5;
    console.log('final result :', finalResult);

    function analysis_details() {
        var analysis = ""
        var rsi_buy = "A lower value of RSI indicates an oversold or undervalued condition, i.e., there is a selling pressure and therefore value of the stock is down\n"
        var rsi_sell = "A higher value of RSI indicates that the stock is becoming overbought or overvalued and may be primed for a trend reversal or corrective pullback in price.\n"
        var rsi_hold = 'A RSI value between 30 to 70 suggests that there is neither buying pressure not selling pressure for the stock. So trader may take a neutral stand.\n'
        
        var macd_buy = "Traders may buy the stock since the MACD(Moving Average Convergence Divergence) has crossed above its signal line.\n"
        var macd_sell = "Traders may sell the stock since the MACD(Moving Average Convergence Divergence) has crossed below the signal line.\n"

        var bollinger_buy = 'The current price maybe touching the lower Bollinger Level which implies that there may be a selling pressure and a reversal in price trend may happen. Therefore, trader may buy the stock.\n'
        var bollinger_sell = 'The current price maybe touching the upper Bollinger Level which implies that there may be a buying pressure and a reversal in price trend may happen. Therefore, trader may sell the stock.\n'
        var bollinger_sma = 'Since the current price has crossed 200SMA, according to Bollinger Bands indicator, the trend may continue till the price reaches either lower or upper level.\n'
        
        var atr_detail = 'ATR values tells the volatility in market. Since current ATR value is towards the lowest of its time period, a breakout may occur. Please note that this indicator does not tell the direction of breakout.\n'

        var adx_strong = 'Value of ADX is high indicating a Strong Trend and is gaining momentum.\n'
        var adx_weak='Value of ADX is low indicating a Weak Trend and fading momentum.\n'

        var ma_buy= 'Increasing values of short term Moving averages indicating a bullish market.'
        var ma_sell='Decreasing values of short term Moving averages indicating a bearish market.'
        var ma_long_buy='Increasig values of long term Moving Averages indicating an overall bullish market and a buying opportunity.'
        var ma_long_sell='Decreasing values of long term Moving Averages indicating an overall bearish market and a selling opportunity.'

        var bollingerBands = getBBandsValue();
        var latestLowerLevel = bollingerBands[0]['Real Lower Band'];
        var latestMidLevel = bollingerBands[0]['Real Middle Band'];
        var latestUpperLevel = bollingerBands[0]['Real Upper Band'];
        var rsi = calculateRSI(pricechart);
        // var latest200DaySMA = calculateSMA(200,0);
        // current_price = stock['close'].iloc[-1]

        if(current_price <= latestLowerLevel)
            analysis = analysis + bollinger_buy;
        else if(current_price >= latestUpperLevel)
            analysis = analysis + bollinger_sell;
        else
            analysis = analysis + bollinger_sma;



        var atr_values = getATRvalue();
        var min_atr = -1000;
        var max_atr = 1000;

        for(var i=0;i<14; i++)
        {
            min_atr = Math.min(min_atr, atr_values[i]);
            max_atr = Math.max(min_atr, atr_values[i]);
        }

        var current_atr = atr_values[0];
        var current_difference_from_lowest = current_atr - min_atr;
        var max_difference = max_atr - min_atr;
        
        var atr_sentiment = (current_difference_from_lowest/max_difference) * 5;

        if (atr_sentiment <= 1)
            analysis = analysis + atr_detail;
        if(rsi<=30)
            analysis = analysis + rsi_buy;
        else if(rsi>=70)
            analysis = analysis + rsi_sell;
        else
            analysis = analysis + rsi_hold;
        
        if(getMACDtrend()==1)
        analysis = analysis + macd_buy;
        else if(getMACDtrend()==0)
        analysis = analysis + macd_sell;
        
        var adx = getADXRvalue();
        if(adx<25)
            analysis = analysis + adx_weak;
        else
            analysis = analysis + adx_strong;

        return analysis;
            
    }




    var result = {
        'finalResult':finalResult,
        'textualData': analysis_details()
    }
    return result;

};