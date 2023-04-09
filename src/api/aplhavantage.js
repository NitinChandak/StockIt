import axios from "axios";

const apikey = "RAHTTJXXUFUS1KB9";
const apikey2 = "";

const api = axios.create({
    baseURL: "https://www.alphavantage.co/query/"
});

// export const getSMA = symbol => {
//     return api.get(`?function=SMA&symbol=${symbol}&interval=weekly&time_period=10&series_type=open&apikey=${apikey}`).then(res => res.data);
// };

// export const getEMA = symbol => {
//     return api.get(`?function=EMA&symbol=${symbol}&interval=weekly&time_period=10&series_type=open&apikey=${apikey}`).then(res => res.data);
// };

export const getMACD = symbol => {
    return api.get(`?function=MACD&symbol=${symbol}&interval=daily&series_type=open&apikey=${apikey}`).then(res => res.data);
};

// export const getSTOCHRSI = symbol => {
//     return api.get(`?function=STOCHRSI&symbol=${symbol}&interval=weekly&time_period=10&series_type=close&fastkperiod=6&fastdmatype=1&apikey=${apikey}`).then(res => res.data);
// };

export const getBBANDS = symbol => {
    return api.get(`?function=BBANDS&symbol=${symbol}&interval=weekly&time_period=5&series_type=close&nbdevup=3&nbdevdn=3&apikey=${apikey}`).then(res => res.data);
};

export const getATR = symbol => {
    return api.get(`?function=ATR&symbol=${symbol}&interval=weekly&interval=daily&time_period=14&apikey=${apikey}`).then(res => res.data);
};

export const getADXR = symbol => {
    return api.get(`?function=ADXR&symbol=${symbol}&interval=daily&time_period=10&apikey=${apikey}`).then(res => res.data);
};

// export const getOBV = symbol => {
//     return api.get(`?function=OBV&symbol=${symbol}&interval=weekly&apikey=${apikey}`).then(res => res.data);
// };