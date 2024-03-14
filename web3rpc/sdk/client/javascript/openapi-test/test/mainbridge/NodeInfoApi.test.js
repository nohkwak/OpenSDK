const OpenSdk = require("opensdk-javascript");
const { expect } = require("@jest/globals");
const { RPC } = require("../constant");

const sdk = new OpenSdk(new OpenSdk.ApiClient(RPC));

describe("mainbridge_ API", () => {
  test("should return mainbridge_", (done) => {
    let callbackOne = function (error, data, response) {
      expect(error).toBeNull();
      expect(data).toBeDefined();
      done();
    };

    sdk.mainbridge.nodeInfo({}, callbackOne);
  });
});
