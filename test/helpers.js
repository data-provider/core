/*
Copyright 2020 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const {
  childEventName,
  isArray,
  isFunction,
  isUndefined,
  queryId,
  childId,
  eventNamespace,
  getAutomaticId,
  ensureArray,
  removeFalsy,
  message,
  warn,
  fromEntries,
  fromEntriesPolyfill
} = require("../src/helpers");

describe("helpers", () => {
  describe("childEventName method", () => {
    it("should add prefix to provided event name", () => {
      expect(childEventName("foo")).toEqual("child-foo");
    });

    it("should not repeat prefix if it already exists", () => {
      expect(childEventName("child-foo")).toEqual("child-foo");
    });
  });

  describe("isArray method", () => {
    it("should return true if provided object is an array", () => {
      expect(isArray(["foo"])).toEqual(true);
    });

    it("should return false if provided object is not an array", () => {
      expect(isArray("foo")).toEqual(false);
    });
  });

  describe("isFunction method", () => {
    it("should return true if provided object is a function", () => {
      expect(isFunction(() => {})).toEqual(true);
    });

    it("should return false if provided object is not a function", () => {
      expect(isFunction("foo")).toEqual(false);
    });
  });

  describe("isUndefined method", () => {
    it("should return true if provided object is undefined", () => {
      expect(isUndefined()).toEqual(true);
    });

    it("should return false if provided object is not undefined", () => {
      expect(isUndefined(null)).toEqual(false);
    });
  });

  describe("queryId method", () => {
    it("should return undefined if undefined query is provided", () => {
      expect(queryId()).toEqual(undefined);
    });

    it("should return query id as string", () => {
      expect(queryId({})).toEqual("({})");
    });
  });

  describe("childId method", () => {
    it("should return id adding queryId", () => {
      expect(childId("foo", {})).toEqual("foo({})");
    });
  });

  describe("eventNamespace method", () => {
    it("should eventName adding id", () => {
      expect(eventNamespace("foo", "foo2")).toEqual("foo-foo2");
    });
  });

  describe("getAutomaticId method", () => {
    it("should return always different ids", () => {
      const id1 = getAutomaticId();
      const id2 = getAutomaticId();
      const id3 = getAutomaticId();
      expect(id1).not.toEqual(id2);
      expect(id2).not.toEqual(id3);
      expect(id1).not.toEqual(id3);
    });
  });

  describe("ensureArray method", () => {
    it("should convert object to array if it was not", () => {
      expect(ensureArray("foo")).toEqual(["foo"]);
    });

    it("should return object if it already was an array", () => {
      const foo = ["foo"];
      expect(ensureArray(foo)).toBe(foo);
    });
  });

  describe("removeFalsy method", () => {
    it("should remove undefined values", () => {
      expect(removeFalsy(["foo", undefined, "foo2"])).toEqual(["foo", "foo2"]);
    });

    it("should remove empty string values", () => {
      expect(removeFalsy(["foo", "", "foo2"])).toEqual(["foo", "foo2"]);
    });

    it("should remove false values", () => {
      expect(removeFalsy(["foo", false, "foo2"])).toEqual(["foo", "foo2"]);
    });

    it("should remove 0 values", () => {
      expect(removeFalsy(["foo", 0, "foo2"])).toEqual(["foo", "foo2"]);
    });
  });

  describe("message method", () => {
    it("should add dataProvider message prefix", () => {
      expect(message("foo")).toEqual("@data-provider/core: foo");
    });
  });

  describe("warn method", () => {
    let sandbox;
    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(console, "warn");
    });

    afterEach(() => {
      sandbox.restore();
    });

    it("should console.warn message", () => {
      warn("foo");
      expect(console.warn.getCall(0).args[0]).toEqual("@data-provider/core: foo");
    });
  });

  describe("fromEntries method polyfill", () => {
    let originalFromEntries;
    beforeEach(() => {
      originalFromEntries = Object.fromEntries;
      Object.fromEntries = null;
    });

    afterEach(() => {
      Object.fromEntries = originalFromEntries;
    });

    it("should work even when no Object.fromEntries method is available", () => {
      const map = new Map();
      map.set("fooKey", "fooValue");
      expect(fromEntries(map)).toEqual({
        fooKey: "fooValue"
      });
    });
  });

  if (!Object.fromEntries) {
    describe("fromEntries method", () => {
      beforeEach(() => {
        Object.fromEntries = fromEntriesPolyfill;
      });

      afterEach(() => {
        delete Object.fromEntries;
      });

      it("should work", () => {
        const map = new Map();
        map.set("fooKey", "fooValue");
        expect(fromEntries(map)).toEqual({
          fooKey: "fooValue"
        });
      });
    });
  }
});
