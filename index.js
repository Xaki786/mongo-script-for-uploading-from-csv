/** @format */

import { MongoClient } from "mongodb";
import fs from "fs";
import csvToJson from "convert-csv-to-json";
import { jsonArr } from "./data.js";
const client = new MongoClient(
  "mongodb+srv://carbonteq:xNS0cOZGX5mh217Y@cluster0.yjgwlv9.mongodb.net/cfar?retryWrites=true&w=majority"
);
async function run() {
  try {
    const database = client.db("cfar");
    const incubator = database.collection("incubator");
    // const results = await incubator.updateMany(
    //   {},
    //   {
    //     $set: {
    //       g_name: null,
    //       g_type: null,
    //       g_industry: null,
    //       g_founded: null,
    //       g_founders: [],
    //       g_headquartersLocation: [],
    //       g_acceleratorProgramFocusAreas: [],
    //       g_notableAlumniCompanies: [],
    //       g_structuredDataUrl: null,
    //       g_pitchBookUrl: null,
    //       g_twitter: null,
    //       g_linkedIn: null,
    //       g_facebook: null,
    //       g_instagram: null,
    //       g_youTube: null,
    //     },
    //   }
    // );
    // console.log(results);
    let fileInputName = "data.csv";
    let fileOutputName = "data.json";
    const incubators = [];
    jsonArr.forEach((j) => {
      const separated = j.split("@");
      const keys = separated[0].split(",");
      const values = separated[1].split(",");
      const inc = {};
      for (let i in keys) {
        if (values[i] === "N/A") {
          inc[keys[i]] = null;
        } else if (values[i].includes("=")) {
          inc[keys[i]] = values[i]
            .replaceAll('"', "")
            .split("=")
            .map((i) => i.trim());
        } else {
          inc[keys[i]] = values[i].trim();
        }
      }
      incubators.push(inc);
    });
    incubators.forEach((inc) => {
      if (typeof inc.g_industry === "string") {
        inc.g_industry = [inc.g_industry];
      }
      if (typeof inc.g_founders === "string") {
        inc.g_founders = [inc.g_founders];
      }
      if (typeof inc.g_acceleratorProgramFocusAreas === "string") {
        inc.g_acceleratorProgramFocusAreas = [
          inc.g_acceleratorProgramFocusAreas,
        ];
      }
      if (typeof inc.g_notableAlumniCompanies === "string") {
        inc.g_notableAlumniCompanies = [inc.g_notableAlumniCompanies];
      }
      if (inc.g_acceleratorProgramFocusAreas === null) {
        inc.g_acceleratorProgramFocusAreas = [];
      }
      if (inc.g_notableAlumniCompanies === null) {
        inc.g_notableAlumniCompanies = [];
      }
    });
    const updateQueries = [];
    for (let incubator of incubators) {
      const copy = { ...incubator };
      const updateQuery = {
        updateOne: {
          filter: {},
          update: { $set: {} },
        },
      };
      updateQuery.updateOne.filter["title"] = copy.g_name;
      delete copy.title;
      updateQuery.updateOne.update.$set = { ...copy };
      updateQueries.push(updateQuery);
    }
    const results = await incubator.bulkWrite(updateQueries);
    console.dir({ results }, { depth: null });
    // console.dir(incubators, { depth: null });

    // csvToJson.generateJsonFileFromCsv(fileInputName, fileOutputName);
    // const results = await incubator
    //   .aggregate([
    //     {
    //       $facet: {
    //         industries: [
    //           { $unwind: "$industry" },
    //           { $group: { _id: "$industry" } },
    //         ],
    //         deadline: [
    //           { $match: { deadline: { $ne: null } } },
    //           { $group: { _id: "$deadline" } },
    //         ],
    //         investments: [
    //           { $match: { investment: { $exists: 1 } } },
    //           {
    //             $bucketAuto: {
    //               groupBy: "$investment",
    //               buckets: 10,
    //             },
    //           },
    //         ],
    //         cities: [
    //           { $match: { city: { $ne: null } } },
    //           { $group: { _id: "$city" } },
    //         ],
    //         states: [
    //           { $match: { state: { $ne: null } } },
    //           { $group: { _id: "$state" } },
    //         ],
    //         fundingTypes: [
    //           { $unwind: "$fundingType" },
    //           { $group: { _id: "$fundingType" } },
    //         ],
    //         programTypes: [
    //           { $unwind: "$programType" },
    //           { $group: { _id: "$programType" } },
    //         ],
    //         countries: [
    //           { $unwind: "$country" },
    //           { $group: { _id: "$country" } },
    //         ],
    //       },
    //     },
    //   ])
    //   .toArray();
    // const filters = {};
    // const data = results[0];
    // for (let result in data) {
    //   filters[result] = data[result].map((obj) => obj._id);
    //   if (result === "investments") {
    //     const min = data[result][0]["_id"]?.min;
    //     const max = data[result][data[result].length - 1]["_id"]?.max;
    //     filters[result] = {
    //       min,
    //       max,
    //     };
    //   }
    // }
    // fs.writeFile("./filters.json", JSON.stringify(filters), (err) => {
    //   if (err) {
    //     console.error(err);
    //   }
    //   // file written successfully
    // });
    // console.dir(filters, { depth: null });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
