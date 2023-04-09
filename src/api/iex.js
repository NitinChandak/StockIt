import axios from "axios";

const api = axios.create({
  baseURL: "https://cloud.iexapis.com/stable"
});

const token = 'pk_7f6bad7a531f43439e5bc5c5276d920c';
export const loadQuotesForStock = symbol => {
  return api.get(`/stock/${symbol}/quote?token=${token}`).then(res => res.data);
};

export const loadLogoForStock = symbol => {
  return api.get(`/stock/${symbol}/logo?token=${token}`).then(res => res.data.url);
};

export const loadRecentNewsForStock = symbol => {
  return api.get(`/stock/${symbol}/news?token=${token}`).then(res => res.data);
};

export const loadChartForStock = (symbol, range) => {
  return api.get(`/stock/${symbol}/chart/${range}?token=${token}`).then(res => res.data);
};


