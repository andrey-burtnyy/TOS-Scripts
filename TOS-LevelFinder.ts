# LevelFinder v2
#
# Looking for 3 bars cent-to-cent
# First - may be everywhere in the last 24 hours.
# Second and third = last two final bars in a row
# Current bar can't be higher or lower - it's broken model
# @OUTPUT: Prints the level, in BLUE background color it's signal for LONG, in RED singal for SHORT, in GREEN both!
#
# Settings:
# Min/Max stock price
# Min/Max ATR
# Max passed current ATR. For example if ATR=1, MaxPassedATR=70, Current ATR can't be biggest then 0.7
# Only to global trend direction on/off. Count of days. Default 12. 1 = off
# Only to local trend direction on/off.
#
# Copyright 2015, Andrey Burtnyy (http://burtnyy.com)
# Licensed under the GNU GPL Version 2.
#

# Settings
def sMinATR = 0.5; # Min ATR
def sMaxATR = 5; # Max ATR
def sMaxPassedATR = 80; # Max passed Current ATR; In %
def sMinPrice = 20; # Min stock price
def sMaxPrice = 135; # Max stock price
def sGlobalTrendLength = 1; # Check for trend for N days. 1 = off
def sLocalTrendEnable = 0; # Check for local trend. 0 = off, 1 = on

def highLevel;
def lowLevel;

# ATR
def ATR = Round((Average(high(period = "DAY"), 65) - Average(low(period = "DAY"), 65)), 2);
def currentATR = Round((high(period = "DAY") - low(period = "DAY")), 2);

def timeframe = GetAggregationPeriod() / AggregationPeriod.MIN;
def barsCount = (30 / timeframe) * 13; # Count of bars of 1 day

# Trend
def MA = if sGlobalTrendLength > 1 then
         MovingAverage(AverageType.SIMPLE, 
                        Fundamental(FundamentalType.CLOSE, period = AggregationPeriod.DAY),
                        sGlobalTrendLength
                        ) else 0;
def trendGlobal = if sGlobalTrendLength > 1 then MA[1] - MA[sGlobalTrendLength] else 0;

if ((ATR >= sMinATR and ATR <= sMaxATR and currentATR <= (ATR * sMaxPassedATR / 100)) and
    (close[0] >= sMinPrice and close[0] <= sMaxPrice)) {

    # SHORT
    if (sGlobalTrendLength <= 1 or trendGlobal < 0) and # GLOBAL TREND
        (sLocalTrendEnable == 0 or close[0] <= open(period = "DAY")[0]) and # LOCAL TREND
        high[1] == high[2] and high[0] <= high[1] {
        highLevel = fold i = 3 to barsCount + 1 with p = 0 while p <= 0 do
                    if (high[i] == high[1] or low[i] == high[1]) then high[1] else 0;
    } else {
        highLevel = 0;
    }

    # LONG
    if (sGlobalTrendLength <= 1 or trendGlobal > 0) and # GLOBAL TREND
        (sLocalTrendEnable == 0 or close[0] >= open(period = "DAY")[0]) and # LOCAL TREND
        low[1] == low[2] and low[0] >= low[1] {
        lowLevel = fold i2 = 3 to barsCount + 1 with p2 = 0 while p2 <= 0 do
                    if (low[i2] == low[1] or high[i2] == low[1]) then low[1] else 0;
    } else {
        lowLevel = 0;
    }
} else {
    highLevel = 0;
    lowLevel = 0;
}

plot out = if highLevel > 0 then highLevel else if lowLevel > 0 then lowLevel else 0;
AssignBackgroundColor(
    if (highLevel > 0 and lowLevel > 0) then Color.GREEN
    else if highLevel > 0 then Color.RED else if lowLevel > 0
    then Color.BLUE else Color.BLACK
);
out.AssignValueColor(if (highLevel > 0 or lowLevel > 0) then Color.CURRENT else Color.BLACK);
