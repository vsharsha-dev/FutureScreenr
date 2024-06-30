import axios from "axios";
import * as cheerio from "cheerio";

const alphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const endpoint = "https://www.moneycontrol.com/india/mutualfunds/mutualfundsinfo/snapshot/"


// for(const alphabet of alphabets) {
//   const axiosResponse = await axios.request({
//     method: "GET",
//     url: endpoint+alphabet,
//     // headers: {
//     //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
//     // }
//   })
//   console.log(axiosResponse);
// }

async function axiosRequest(endpoint) {
  const axiosResponse = await axios.request({
    method: "GET",
    url: endpoint
  })

  const data = axiosResponse.data
  return data
}

function getNameAndAmounts(fundDetailsPage) {
  let details = {}
  const $ = cheerio.load(fundDetailsPage)

  // Get name of the fund
  let fundName = "NA"
  fundName = $('h1.page_heading').text()

  // Get NAV, Fund Size, Expense Ratio
  const amounts = []
  const amountElements = $('span.amt')
  amountElements.each((index, element) => {
    amounts.push($(element).text())
  })

  const [fundNAV, fundSize, expenseRatio] = amounts

  // Get Latest NAV Date, Percentage of fund size invested in the category, Category Average Expense Ratio
  const amountDescriptions = []
  const amountDescriptionElements = $('div.grayvalue')
  amountDescriptionElements.each((index, element) => {
    amountDescriptions.push($(element).text())
  })
  const [navDate, investmentInCategory, categoryAvgExpenseRatio] = amountDescriptions

  details = {
    fundName: fundName,
    nav: fundNAV,
    navDate: navDate,
    fundSize: fundSize,
    investmentInCategory: investmentInCategory,
    expenseRatio: expenseRatio,
    categoryAvgExpenseRatio: categoryAvgExpenseRatio
  }

  return details
}

function getParameters(fundDetailsPage) {
  const $ = cheerio.load(fundDetailsPage)

  // Get Crisil Rank and Risk
  let crisilRank = "NA";
  let risk = "NA"

  let crisilRankElements = $('div.crisil_rank_block');
  crisilRank = crisilRankElements.children('p').text()
  if(!crisilRank){
    crisilRank = crisilRankElements.children('.muttxtdn').children('span.icfullstar').length
  }

  risk = $('div.meter_graph').children('span.status').text()
  // console.log(risk);
  return {crisilRank: crisilRank, risk: risk};
}

function getReturns(fundDetailsPage) {
  const $ = cheerio.load(fundDetailsPage)
  const returns = {
    lumpsum : {
      absoluteReturns: {},
      annualisedReturns: {}
    },
    sip: {
      absoluteReturns: {},
      annualisedReturns: {}
    }
  }

  // Get Absolute Returns for Lumpsum 
  const lumpsumOneYearAbsolute = $('div.returns_table table tbody tr').eq(5).children('td').eq(3).html()
  const lumpsumThreeYearAbsolute = $('div.returns_table table tbody tr').eq(7).children('td').eq(3).html()
  const lumpsumFiveYearAbsolute = $('div.returns_table table tbody tr').eq(8).children('td').eq(3).html()
  const lumpsumTenYearAbsolute = $('div.returns_table table tbody tr').eq(9).children('td').eq(3).html()
  const lumpsumSinceInceptionAbsolute = $('div.returns_table table tbody tr').eq(10).children('td').eq(3).html()

  const lumpsumAbsoluteReturns = {
    '1 Year': lumpsumOneYearAbsolute,
    '3 Year': lumpsumThreeYearAbsolute,
    '5 Year': lumpsumFiveYearAbsolute,
    '10 Year': lumpsumTenYearAbsolute,
    'Since Inception': lumpsumSinceInceptionAbsolute
  }
  returns.lumpsum.absoluteReturns = lumpsumAbsoluteReturns

  // Get Annualised Returns for Lumpsum
  const lumpsumOneYearAnnualised = $('div.returns_table table tbody tr').eq(5).children('td').eq(4).html()
  const lumpsumThreeYearAnnualised = $('div.returns_table table tbody tr').eq(7).children('td').eq(4).html()
  const lumpsumFiveYearAnnualised = $('div.returns_table table tbody tr').eq(8).children('td').eq(4).html()
  const lumpsumTenYearAnnualised = $('div.returns_table table tbody tr').eq(9).children('td').eq(4).html()
  const lumpsumSinceInceptionAnnualised = $('div.returns_table table tbody tr').eq(10).children('td').eq(4).html()

  const lumpsumAnnualisedReturns = {
    '1 Year': lumpsumOneYearAnnualised,
    '3 Year': lumpsumThreeYearAnnualised,
    '5 Year': lumpsumFiveYearAnnualised,
    '10 Year': lumpsumTenYearAnnualised,
    'Since Inception': lumpsumSinceInceptionAnnualised
  }
  returns.lumpsum.annualisedReturns = lumpsumAnnualisedReturns

  // Get Absolute Returns for SIP 
  const sipOneYearAbsolute = $('div.sipreturns_table table tbody tr').eq(0).children('td').eq(4).html()
  const sipThreeYearAbsolute = $('div.sipreturns_table table tbody tr').eq(2).children('td').eq(4).html()
  const sipFiveYearAbsolute = $('div.sipreturns_table table tbody tr').eq(3).children('td').eq(4).html()
  const sipTenYearAbsolute = $('div.sipreturns_table table tbody tr').eq(4).children('td').eq(4).html()

  const sipAbsoluteReturns = {
    '1 Year': sipOneYearAbsolute,
    '3 Year': sipThreeYearAbsolute,
    '5 Year': sipFiveYearAbsolute,
    '10 Year': sipTenYearAbsolute
  }
  returns.sip.absoluteReturns = sipAbsoluteReturns

  // Get Annualised Returns for Lumpsum
  const sipOneYearAnnualised = $('div.sipreturns_table table tbody tr').eq(0).children('td').eq(5).html()
  const sipThreeYearAnnualised = $('div.sipreturns_table table tbody tr').eq(2).children('td').eq(5).html()
  const sipFiveYearAnnualised = $('div.sipreturns_table table tbody tr').eq(3).children('td').eq(5).html()
  const sipTenYearAnnualised = $('div.sipreturns_table table tbody tr').eq(4).children('td').eq(5).html()

  const sipAnnualisedReturns = {
    '1 Year': sipOneYearAnnualised,
    '3 Year': sipThreeYearAnnualised,
    '5 Year': sipFiveYearAnnualised,
    '10 Year': sipTenYearAnnualised
  }
  returns.sip.annualisedReturns = sipAnnualisedReturns

  return {returns: returns}
}

function getPortfolioParameters(fundDetailsPage) {
  const $ = cheerio.load(fundDetailsPage)
  const portfolioParameters = {
    numOfStocks: "NA",
    turnoverRatio: "NA",
    topHoldings: []
  }

  // Get Turnover Ratio and Portfolio size(No. of Stocks)
  const turnoverRatio = $('section.section_six div div.subheading span').eq(0).text()
  const numOfStocks = $('div.portfolio_container div.tab-content div#port_tab1 div.investment_block').eq(1).children('span').eq(0).text()

  // Assign only if they are not null/undefined
  turnoverRatio && (portfolioParameters.turnoverRatio = turnoverRatio)
  numOfStocks && (portfolioParameters.numOfStocks = numOfStocks)

  for(let i = 0; i < 5; i++){
    const holdingPercentage = $('table#portfolioEquityTable tbody tr').eq(i).children('td').eq(3).text()
    const company =  $('table#portfolioEquityTable tbody tr').eq(i).children('td').eq(0).children('span').eq(1).text()
    
    company && holdingPercentage && (portfolioParameters.topHoldings.push({
      company: company,
      holdingPercentage: holdingPercentage 
    }))
  }
  // const holdingPercentage = $('table#portfolioEquityTable tbody tr').eq(0).children('td').eq(3).html()
  // const company =  $('table#portfolioEquityTable tbody tr').eq(0).children('td').eq(0).children('span').eq(1).text()

  // console.log(company);
  return portfolioParameters;
}

function getDetails(fundDetailsPage) {
  let details = {}

  const nameAndAmounts = getNameAndAmounts(fundDetailsPage)

  const otherParameters = getParameters(fundDetailsPage)

  const returns = getReturns(fundDetailsPage)

  const portfolioParameters = getPortfolioParameters(fundDetailsPage)

  Object.assign(details, nameAndAmounts, otherParameters, returns, portfolioParameters)

  return details
}

async function scrapeWebpage() {

  const fundListPage = await axiosRequest(endpoint+alphabets[0])
  const $ = cheerio.load(fundListPage)

  const fundLinkElements = $('a.verdana12blue')

  let fundLinks = []
  
  fundLinkElements.each((index, element) => {
    const url = $(element).attr('href')
    fundLinks.push(url);
  })

  const fundDetailsPage = await axiosRequest(fundLinks[700])

  let details = getDetails(fundDetailsPage)
  console.log(details);
}

scrapeWebpage()

// app.listen("3000", () => {
//   console.log("Server running on port 3000");
// })