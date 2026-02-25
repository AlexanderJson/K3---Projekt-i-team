import { jest } from "@jest/globals";

let fileToText;
let readCsv;
let readLocalCsv;

if (typeof global.File === "undefined") {
  global.File = class File {
    constructor(parts = [], name = "file.csv", options = {}) {
      this._text = parts.map(p =>
        typeof p === "string" ? p : String(p)
      ).join("");
      this.name = name;
      this.type = options.type || "";
      this.size = this._text.length;
    }
    async text() {
      return this._text;
    }
  };
}

describe("csvReader", () => {

  const validCsv =
`id,title,status
1,Task A,OPEN
2,Task B,DONE`;
const createFile = (content, name = "test.csv", sizeOverride = null) => {
  const textValue = String(content);

  return {
    name,
    size: sizeOverride ?? textValue.length,
    async text() {
      return textValue;
    }
  };
};
  beforeEach(async () => {
    jest.clearAllMocks();

    const mod = await import("../js/Reader/csvReader.js");
    fileToText = mod.fileToText;
    readCsv = mod.readCsv;
    readLocalCsv = mod.readLocalCsv;
  });




  describe("fileToText()", () => {

    test("reads valid file", async () => {
      const file = createFile(validCsv);
      const text = await fileToText(file);
      expect(text).toContain("Task A");
    });

    test("throws error if file missing", async () => {
      await expect(fileToText(null))
        .rejects.toThrow();
    });

    test("throws error if wrong file object", async () => {
      await expect(
        fileToText({ name: "x.csv", size: 1 })
      ).rejects.toThrow();
    });

    test("throws error if invalid extension", async () => {
      const file = createFile("data", "test.txt");
      await expect(fileToText(file))
        .rejects.toThrow();
    });

    test("throws error if file is too large", async () => {
      const bigfile = 12 * 1024 * 1024;
      const file = createFile(validCsv, "big.csv", bigfile);
      await expect(fileToText(file))
        .rejects.toThrow();
    });

  });


  describe("readLocalCsv", () => {
    test("successfully fetch / parse csv", async () =>
    {
        global.fetch = jest.fn(() => 
            Promise.resolve({
                ok:true,
                text: () => Promise.resolve(validCsv)
            })
        );
        const result = await readLocalCsv("/path.csv");
        expect(result.length).toBe(2);
        expect(result[0].id).toBe("1");
        expect(result[1].status).toBe("DONE");
    })

    test("throws error if fetch fails", async () => {
        global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

        await expect(readLocalCsv("/error.csv"))
        .rejects.toThrow();
    })

  })

  describe("readCsv()", () => {

    test("parses valid csv", async () => {
      const file = createFile(validCsv);
      const result = await readCsv(file);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe("1");
      expect(result[0].title).toBe("Task A");
      expect(result[1].status).toBe("DONE");
    });

    test("throws error if no rows", async () => {
      const file = createFile("");
      await expect(readCsv(file))
        .rejects.toThrow();
    });

    test("throws error if no headers", async () => {
      const file = createFile("\n\n");
      await expect(readCsv(file))
        .rejects.toThrow();
    });

  });

});