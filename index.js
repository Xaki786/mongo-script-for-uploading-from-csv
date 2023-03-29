/** @format */

import { MongoClient } from "mongodb";
import { updated_incubators } from "./updated_inc.js";
import { jsonArr } from "./data.js";
const client = new MongoClient(
  "mongodb+srv://carbonteq:xNS0cOZGX5mh217Y@cluster0.yjgwlv9.mongodb.net/cfar?retryWrites=true&w=majority"
);
async function run() {
  try {
    const database = client.db("cfar");
    const incubator = database.collection("incubator");
    // const resultsw = await incubator.updateMany(
    //   {},
    //   {
    //     $set: {
    //       g_name: null,
    //       g_type: null,
    //       g_industry: [],
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
    // console.log(resultsw);
    updated_incubators.forEach((inc, index) => {
      for (let i in inc) {
        if (inc[i] === "N/A" || inc[i] === "-" || inc[i] === 0) {
          inc[i] = null;
        }
      }
      inc["g_name"] = inc.name;
      inc["g_acceleratorProgramFocusAreas"] =
        inc["accelerator program focus areas"]?.split(",") ?? [];
      inc["g_facebook"] = inc.facebook;
      inc["g_founded"] = inc.founded?.toString() ?? null;
      inc["g_founders"] = inc.founders?.split(",") ?? [];
      inc["g_headquartersLocation"] =
        inc["headquarters location"]?.split(",") ?? [];
      inc["g_industry"] = inc.industry?.split(",") ?? [];
      inc["g_instagram"] = inc.instagram;
      inc["g_linkedIn"] = inc.linkedIn;
      inc["g_notableAlumniCompanies"] =
        inc["notable alumni companies"]?.split(",") ?? [];
      inc["g_pitchBookUrl"] = inc["pitchbook url"];
      inc["g_structuredDataUrl"] = inc["structured data url"];
      inc["g_twitter"] = inc.twitter;
      inc["g_type"] = inc.type;
      inc["g_youTube"] = inc.youTube;
      for (let i in inc) {
        if (!i.includes("g_")) {
          delete inc[i];
        }
        if (Array.isArray(inc[i])) {
          inc[i] = inc[i].map((j) => j.trim());
        } else if (typeof inc[i] === "string") {
          inc[i] = inc[i].trim();
        }
      }
    });

    const updateQueries = [];
    for (let incubator of updated_incubators) {
      const copy = { ...incubator };
      const updateQuery = {
        updateOne: {
          filter: {},
          update: { $set: {} },
        },
      };
      updateQuery.updateOne.filter["title"] = copy.g_name;
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
