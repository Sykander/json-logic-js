const { assert } = require("chai");
const jsonLogic = require("../logic.js");

describe("async_apply() tests", () => {
  context("Given an async operator", () => {
    const http = (url) =>
      new Promise((resolve) => setTimeout(() => resolve(url), 1));
    jsonLogic.add_operation("http", http);

    it("Should give expected result", async () => {
      const url = "http://google.com";
      const expected = await http(url);
      const rule = { http: [url] };

      const result = await jsonLogic.async_apply(rule);

      assert.equal(result, expected);
    });

    it("Should handle async maps rules", async () => {
      const urls = [
        "http://google.com",
        "http://github.com",
        "http://jsonlogic.com",
      ];
      const expected = await Promise.all(urls.map(http));
      const rule = {
        map: [{ var: "urls" }, { http: [{ var: "" }] }],
      };
      const data = { urls };

      const result = await jsonLogic.async_apply(rule, data);

      assert.deepEqual(result, expected);
    });

    it("Should handle async reduce if conditions", async () => {
      const urls = [null, null, "http://google.com"];
      const expected = urls[2];
      const rule = {
        reduce: [
          { var: "urls" },
          {
            if: [
              { http: { var: "current" } },
              { var: "current" },
              { var: "accumulator" },
            ],
          },
        ],
      };
      const data = { urls };

      const result = await jsonLogic.async_apply(rule, data);

      assert.equal(result, expected);
    });

    it("Should handle async filters", async () => {
      const urls = [null, null, "http://google.com"];
      const expected = urls.filter((url) => url);
      const rule = {
        filter: [{ var: "urls" }, { http: { var: "" } }],
      };
      const data = { urls };

      const result = await jsonLogic.async_apply(rule, data);

      assert.deepEqual(result, expected);
    });
  });
});
