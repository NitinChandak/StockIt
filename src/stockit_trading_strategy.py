import yfinance
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from math import floor
import json

file = open('/stock_data.json')
data = json.load(file)
stock = pd.DataFrame.from_dict(data, orient='index')

def get_rsi(stock, period = 14):
    rsi_df_lib = pd.DataFrame(talib.RSI(stock['close'],timeperiod=period))
    rsi_df_lib.columns = ['rsi']
    return rsi_df_lib

def get_rsi_trend(rsi_df):
  if(rsi_df['rsi'].iloc[-1] > 70):
    return 0 #sell
  if(rsi_df['rsi'].iloc[-1] < 30):
    return 1 #buy
  else:
    return 2 #hold

def get_macd(stock):
    macd_df_lib = pd.DataFrame(talib.MACD(stock['close'])).transpose()
    macd_df_lib.columns = ['macd', 'signal', 'hist']
    return macd_df_lib

macd_df_lib = get_macd(stock)
macd_df_lib

def get_macd_trend(macd_df_lib):
  if(macd_df_lib['macd'].iloc[-1] > macd_df_lib['signal'].iloc[-1]):
    return 1 #buy
  elif(macd_df_lib['macd'].iloc[-1] < macd_df_lib['signal'].iloc[-1]):
    return 0 #sell
  else:
    return 2 #hold

def get_ema(stock, period):
    exp = stock['close'].ewm(span = period, adjust = False, min_periods = period).mean()
    ema_df = pd.DataFrame(exp)
    col_name = 'EMA_' + str(period)
    ema_df.columns = [col_name]
    return ema_df

ema_50df = get_ema(stock, 50)
ema_200df = get_ema(stock, 200)

def get_ema_trend(ema_50df, ema_200df):
  if(ema_50df['EMA_50'].iloc[-1] > ema_200df['EMA_200'].iloc[-1]):
    return 1 #buy
  elif(ema_50df['EMA_50'].iloc[-1] < ema_200df['EMA_200'].iloc[-1]):
    return 0 #sell
  else:
    return 2 #hold

def get_bollinger_bands(stock, rate=20):
    boll_band_df_lib = pd.DataFrame(talib.BBANDS(stock['close'], timeperiod=rate)).transpose()
    boll_band_df_lib.columns = ['boll_up', 'boll_middle', 'boll_down']
    return boll_band_df_lib
boll_band_df_lib = get_bollinger_bands(stock)

def get_sma(stock,period):
  SMA = talib.SMA(stock['close'],period).tolist()
  return SMA
SMA50 = get_sma(stock,50)
plt.plot(SMA50)
plt.plot(stock['close'])

SMA200 = get_sma(stock,200)
def get_sma_slope(sma,period):
  slope = (sma[-1] - sma[-1-period]) / period
  return slope

def get_sma_trend(stock,SMA):
  if(stock['close'].iloc[-1]>SMA[-1]):
    return 1
  return 0

# Combination of Indicators : 
# 1: RSI + Bollinger Bands


'''
Details : 

It allows us to know whether prices are high and overbought or low and oversold.
The strategy of using Bollinger Bands and RSI is to watch for moments when prices hit the lower band and RSI hits the oversold region (Below 30). This would be a good entry price to buy. If you are looking to sell, 
you can wait for prices to hit the upper band and RSI hits the overbought region (above 70).
In case of bollingger bands, if the price touches either of the lower or upper level, a reversalin direction can be predicted.
Also if the price crosses the 20sma line, a continuation in trend can be expected.

Returning value between -100 to 100:  -100 = strong sell, 100 = strong buy
Ratio of weightage for Bollinger : RSI :: 30 : 70

'''

def rsi_and_bollinger(stock,bollingerBands):
    '''
    assuming the variables in hand : 
    1. current price
    2. bollinger band 2D array consisting of data : 
    S.No. | Time/Date | Upper-Bollinger-level | Lower-Bollinger-level | 20-Period-SMA
      1   |   11:00   |     500               |     400               |     450      
      2   |   11:05   |     499               |     402               |     449       
    3. RSI     
    
    '''
    
    bollingerSentiment = 0
    bollingerRange = 30
    
    '''
    sentiment : 
    bollingerRange for strong buy
    -bollingerRange for strong sell
    '''
    
    
    latest20DaySMA = get_sma(stock,20)
    latestUpperLevel = bollingerBands['boll_up'].iloc[-1]
    latestLowerLevel = bollingerBands['boll_down'].iloc[-1]
    
    current_price = stock['close'].iloc[-1]
    
    # checking if current price has touched or crossed either bollinger level
    if(current_price <= latestLowerLevel):
        bollingerSentiment = bollingerRange
    elif(current_price ?>= latestUpperLevel):
        bollingerSentiment = -bollingerRange
    elif(current_price == latest20DaySMA):
        bollingerSentiment = 0
    elif (current_price > latest20DaySMA) and (latestUpperLevel != latest20DaySMA):
        bollingerSentiment = bollingerRange*(double(current_price - latest20DaySMA)/(latestUpperLevel - latest200DaySMA))
    elif (latestLowerLevel != latest20DaySMA):
        bollingerSentiment = -bollingerRange*(double(current_price - latest20DaySMA)/(latestLowerLevel - latest200DaySMA))
    
    
    '''
    # checking for convergence or divergence pattern
    for datapoint in bollingerBands:
    upperLevel = datapoint['Upper Bollinger level']
    lowerLevel = datapoint['Lower Bollinger level']
    midLevel = datapoint['20-Period SMA']
    difference_pattern.append(upperLevel - lowerLevel)
    '''
    
    #RSI
    
    # rsiRange = 100 - bollingerRange
    rsiSentiment = 0
    
    rsi = rsi_df_lib['rsi'].iloc[-1]
    
    if(rsi <= 30 and rsi >= 25):
        rsiSentiment = 50
    elif(rsi <= 25  and  rsi >= 20):
        rsiSentiment = 55
    elif(rsi <= 20 and rsi >= 15):
        rsiSentiment = 60
    elif(rsi <= 15 and rsi >= 10):
        rsiSentiment = 65
    elif(rsi <= 10):
        rsiSentiment = 70
    
    
    elif(rsi <= 75 and rsi >= 70):
        rsiSentiment = -50
    elif(rsi <= 80 and rsi >= 75):
        rsiSentiment = -55
    elif(rsi <= 85 and rsi >= 80):
        rsiSentiment = -60
    elif(rsi <= 90 and rsi >= 85):
        rsiSentiment = -65
    elif(rsi >= 90):
        rsiSentiment = -70
    else:
        rsiSentiment = -1 * (2.5*(rsi-30) - 50)
    '''
    rsi : 30------x------70
    sent: 50------y------(50)
    
    so
    
    (x-30)/40 = (y+50)/100 
    
    where answer = -y
    '''
    

    
    finalSentiment = bollingerSentiment + rsiSentiment
  # returning value between -100 to 100:  -100 = strong sell, 100 = strong buy
  # ratio of weightage for Bollinger : RSI :: 30 : 70
    return finalSentiment

# 2: RSI + MACD

'''
Details:

Both the moving average convergence divergence (MACD) and the relative strength index (RSI) rank among the most popular momentum indicators.
MACD is a momentum indicator that illustrates the relationship between the 26-day and 12-day exponential moving averages.
While RSI also measures momentum, it reflects this momentum through a different analytic approach. 
RSI can identify buying opportunities by pinpointing trade opportunities where conditions of a stock are either overbought or oversold. 
In situations where conditions are overbought, RSI suggests that the price may be inflated and primed to decline. 
In oversold conditions, RSI suggests that traders may have overreacted and have now created value by depressing price and demand for a stock.
If one indicator signals momentum in a certain direction, check the other indicator to see whether it agrees. 
If their views are split, you may struggle to reach a conclusion that gives you enough confidence to open a position. 
When both agree, though, traders may feel more confident taking action.

ratio of weightage for MACD : RSI :: 30 : 70


'''


def rsi_and_macd():
    
    '''
    variables received : 
    1. current price
    2. macd line value
    3. signal line value
    4. rsi
    
    '''
    macdRange = 30
    macdSentiment = 0
    current_price = stock['close'].iloc[-1]
    macdLineValue = macd_df_lib['macd'].iloc[-1]
    signalLineValue = macd_df_lib['signal'].iloc[-1]
    previousMACDLineValue = macd_df_lib['macd'].iloc[-2]
    previousSignalLineValue = macd_df_lib['signal'].iloc[-2]
    if macdLineValue > signalLineValue : 
        macdSentiment = macdRange
    elif macdLineValue < signalLineValue : 
        macdSentiment = -macdRange
    
    
    # incase of crossing line, strong trend reversal 
    elif macdLineValue == signalLineValue : 
        if previousMACDLinevalue > previousSignalLineValue:
            macdSentiment = -macdRange
        else:
            macdSentiment = macdRange

    # RSI
    # rsiRange = 70
    rsi = rsi_df_lib['rsi'].iloc[-1]
    rsiSentiment = 0
    
    if(rsi <= 30 and rsi >= 25):
        rsiSentiment = 45
    elif(rsi <= 25 and rsi >= 20):
        rsiSentiment = 50
    elif(rsi <= 20 and rsi >= 15):
        rsiSentiment = 60
    elif(rsi <= 15 and rsi >= 10):
        rsiSentiment = 65
    elif(rsi <= 10):
        rsiSentiment = 70
    
    
    elif(rsi <= 75 and rsi >= 70):
        rsiSentiment = -45
    elif(rsi <= 80 and rsi >= 75):
        rsiSentiment = -50
    elif(rsi <= 85 and rsi >= 80):
        rsiSentiment = -60
    elif(rsi <= 90 and rsi >= 85):
        rsiSentiment = -65
    elif(rsi >= 90):
        rsiSentiment = -70
    else:
      rsiSentiment = -1 * (2.25*(rsi-30) - 45)
    
    '''
    rsi : 30------x------70
    sent: 45------y------(-45)
    
    so
    
    (x-30)/40 = (y+45)/90 
    
    where answer = -y
    '''
    
    
    
    finalSentiment = macdSentiment + rsiSentiment
    # returning value between -100 to 100:  -100 = strong sell, 100 = strong buy
    # ratio of weightage for MACD : RSI :: 30 : 70
    
    return finalSentiment

# RSI + MACD

'''
Details:
Macd above signal and zero line  + price touching lower bollinger => buy
Macd below signal and zzero line + price touching upper bollinger => sell
else undecided

weight = 0.25
result = weight*macd_trend*100 + (1-weight)*bollingerSentiment*(10/3)

'''


def macd_and_bollinger(stock, MACD, bollingerBands):
  '''
    stock dataframe
    MACD : Dataframe consisting of columns macd, signal and hist=macd-signal
    bollingerBands

  '''
  bollingerRange = 30
  bollingerSentiment = 0
  SMA20 = get_sma(stock,20)
  SMA200 = get_sma(stock,200)
  latestUpperLevel = bollingerBands['boll_up'].iloc[-1]
  latestLowerLevel = bollingerBands['boll_down'].iloc[-1]
  current_price = stock['close'].iloc[-1]

  if(current_price <= latestLowerLevel):
    bollingerSentiment = bollingerRange
  elif(current_price >= latestUpperLevel):
    bollingerSentiment = -bollingerRange
  elif(current_price == SMA20):
    bollingerSentiment = 0
  elif current_price > SMA20 and (latestUpperLevel != SMA200):
    bollingerSentiment = bollingerRange*(double(current_price - latest20DaySMA)/(latestUpperLevel - SMA200))
  elif (latestLowerLevel != SMA200):
    bollingerSentiment = -bollingerRange*(double(current_price - latest20DaySMA)/(latestLowerLevel - SMA200))

  macd_trend = get_macd_trend(MACD)

  '''
    BollingerSentiment : -30----x----30
    Macd_trend : {-1,1}
  '''
  weight = 0.25
  res = weight*macd_trend*100 + (1-weight)*bollingerSentiment*(10/3) 
  return res

def sma200_and_rsi(stock,rsi):
  sma200 = get_sma(stock,200)
  sma_slope = get_sma_slope(sma200, 50)
  sma_range = 20
  smaSentiment = 0
  if(sma_slope>5):
    smaSentiment = 20
  if(sma_slope<5):
    smaSentiment = -20
  else:
    smaSentiment = 4*sma_slope
  rsiSentiment = 0
  rsiRange = 20
  if(rsi<20):
    rsiSentiment = rsiRange
  if(rsi>80):
    rsiSentiment = -rsiRange
  else:
    rsiSentiment = -rsiRange + (2*rsiRange)*(rsi-20)/(60)
  weight = 0.3
  res = weight*smaSentiment*5 + (1-weight)*rsiSentiment*5
  return res

def sma200_and_sma50(stock,sma50,sma200):
  slope50=get_sma_slope(sma50,5)
  slope200=get_sma_slope(sma200,5)
  res=0
  if(sma200.iloc[-1]>sma50.iloc[-1] and sma200.iloc[-2]<sma50.iloc[-2]):
    res=-1
  elif(sma200.iloc[-1]<sma50.iloc[-1] and sma200.iloc[-2]>sma50.iloc[-2]):
    res=1
  if(slope50>1):
    slope50=1
  if(slope50<-1):
    slope50=-1
  if(slope200>1):
    slope200=1
  if(slope50<-1):
    slope50=-1
  if(res==-1):
    res=res*(slope200-slope50)
  else:
    res=res*(slope50-slope200)
  res=res*50
  return res

def finalPred():
  r1=rsi_and_bollinger(stock,boll_band_df_lib)
  r2=rsi_and_macd()
  r3 = sma200_and_sma50(stock, sma50, sma200)
  r4=macd_and_bollinger(stock,macd_df_lib,boll_band_df_lib)
  r5=sma200_and_rsi(stock,rsi_df_lib['rsi'].iloc[-1])
  result=(r1+r2+r3+r4+r5)/5
  return result

def analysis_details(stock,rsi,macd,sma20,sma100,ema20,sma200,adx):
  analysis=[]
  rsi_buy = "A lower value of RSI indicates an oversold or undervalued condition, i.e., there is a selling pressure and therefore value of the stock is down"
  rsi_sell = "A higher value of RSI indicates that the stock is becoming overbought or overvalued and may be primed for a trend reversal or corrective pullback in price."
  rsi_hold = 'A RSI value between 30 to 70 suggests that there is neither buying pressure not selling pressure for the stock. So trader may take a neutral stand.'
  
  macd_buy = "Traders may buy the stock since the MACD(Moving Average Convergence Divergence) has crossed above its signal line."
  macd_sell = "Traders may sell the stock since the MACD(Moving Average Convergence Divergence) has crossed below the signal line."

  bollinger_buy = 'The current price maybe touching the lower Bollinger Level which implies that there may be a selling pressure and a reversal in price trend may happen. Therefore, trader may buy the stock.'
  bollinger_sell = 'The current price maybe touching the upper Bollinger Level which implies that there may be a buying pressure and a reversal in price trend may happen. Therefore, trader may sell the stock.'
  bollinger_sma = 'Since the current price has crossed 200SMA, according to Bollinger Bands indicator, the trend may continue till the price reaches either lower or upper level.'

  ma_buy= 'Increasing values of short term Moving averages indicating a bullish market.'
  ma_sell='Decreasing values of short term Moving averages indicating a bearish market.'
  ma_long_buy='Increasig values of long term Moving Averages indicating an overall bullish market and a buying opportunity.'
  ma_long_sell='Decreasing values of long term Moving Averages indicating an overall bearish market and a selling opportunity.'
  


  latestUpperLevel = bollingerBands['boll_up'].iloc[-1]
  latestLowerLevel = bollingerBands['boll_down'].iloc[-1]
  current_price = stock['close'].iloc[-1]

  if(current_price <= latestLowerLevel):
    analysis.append(bollinger_buy)
  elif(current_price >= latestUpperLevel):
    analysis.append(bollinger_sell)
  else:
    analysis.append(bollinger_sma)


  if(rsi<=30):
    analysis.append(rsi_buy)
  elif(rsi>=70):
    analysis.append(rsi_sell)
  else:
    analysis.append(rsi_hold)
  
  if(get_macd_trend(macd)==1)
    analysis.append(macd_buy)
  elif(get_macd_trend(macd)==0)
    analysis.append(macd_sell)

  
  if(get_slope_sma(sma20,10,-1)>1 and get_slope_ema(ema20,5,-1)<-2):
    analysis.append(ma_buy)
  elif(get_slope_sma(sma20,10,-1)<-1 and get_slope_ema(ema20,5,-1)<-2):
    analysis.append(ma_sell)

  if(get_slope_sma(sma100,10,-1)>1 and get_slope_ema(ema100,5,-1)<-2):
    analysis.append(ma_long_buy)
  elif(get_slope_sma(sma100,10,-1)<-1 and get_slope_ema(ema100,5,-1)<-2):
    analysis.append(ma_long_sell)

  return analysis