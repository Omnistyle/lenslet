module.exports = {
  GetDeepSearchResults: {
    requiredParams: ["address", "citystatezip"]
  },
  GetUpdatedPropertyDetails: {
    requiredParams: ["zpid"]
  },
  GetDeepComps: {
    requiredParams: ["zpid", "count"]
  },
  GetRateSummary: {
    requiredParams: []
  },
  GetMonthlyPayments: {
    requiredParams: ["price"]
  },
  GetDemographics: {
    requiredParams: []
  },
  GetRegionChildren: {
    requiredParams: []
  },
  GetRegionChart: {
    requiredParams: ["unit-type"]
  },
  GetSearchResults: {
    requiredParams: ["address", "citystatezip"]
  },
  GetZestimate: {
    requiredParams: ["zpid"]
  },
  GetChart: {
    requiredParams: ["zpid", "unit-type"]
  },
  GetComps: {
    requiredParams: ["zpid", "count"]
  }
};