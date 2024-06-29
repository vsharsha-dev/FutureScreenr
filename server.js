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

function getAmounts(fundDetailsPage) {
  let details = {}
  const $ = cheerio.load(fundDetailsPage)

  // Get NAV, Fund Size, Expense Ratio
  const amounts = []
  const amountElements = $('span.amt')
  amountElements.each((index, element) => {
    amounts.push($(element).text())
  })
  const [fundNAV, fundSize, expenseRatio] = amounts
  details = {
    nav: fundNAV,
    fundSize: fundSize,
    expenseRatio: expenseRatio
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

function getDetails(fundDetailsPage) {

  const amounts = getAmounts(fundDetailsPage)

  const otherParameters = getParameters(fundDetailsPage)

  console.log(amounts);
  console.log(otherParameters);

  // return details
}

async function scrapeWebpage() {

  const fundListPage = await axiosRequest(endpoint+alphabets[0])
  const $ = cheerio.load(fundListPage)

  const fundLinkElements = $('a.verdana12blue')

  let fundLinks = []
  
  fundLinkElements.each((index, element) => {
    const url = $(element).attr('href')
    // console.log(url);
    fundLinks.push(url);
  })

  const fundDetailsPage = await axiosRequest(fundLinks[0])

  let details = getDetails(fundDetailsPage)
  // console.log(details);
}

scrapeWebpage()

// app.listen("3000", () => {
//   console.log("Server running on port 3000");
// })