const { createReadStream, writeFileSync } = require("fs")
const csv = require("papaparse")
const { polygonContains } = require("d3-polygon")
const boundaries = require("./boundaries.json")

const regions = []

for (const feature of boundaries.features) {
  if (feature.geometry.type == "Polygon") {
    regions.push({
      name: feature.properties.REGC2020_V1_00_NAME,
      path: feature.geometry.coordinates[0]
    })
  }
}

csv.parse(createReadStream("locations.csv"), {
  header: true,
  dynamicTyping: true,
  complete: (locations) => {
    const outputLocations = [...locations.data]

    for (const location of outputLocations) {
      for (const region of regions) {
        if (polygonContains(region.path, [location.long, location.lat])) {
          location.region = region.name
          break
        }
      }
    }

    writeFileSync("./locations-regions.csv", csv.unparse(outputLocations))
  }
})
