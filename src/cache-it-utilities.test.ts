import { CacheItUtils } from "./index";

/** Test cases for the CacheItUtils class */

describe("CacheItUtils", () => {
  test("AddBaseKey: should add a base key to a key generator", () => {
    const keyGenerator = CacheItUtils.addBaseKey("base");


    expect(keyGenerator)
      .toBeDefined();

    expect(keyGenerator.generateKey())
      .toMatch(/^\$CACHE-IT_base_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });

  test("GenerateKey: should generate a key", () => {
    const keyGenerator = CacheItUtils;


    expect(keyGenerator)
      .toBeDefined();

    expect(keyGenerator.generateKey())
      .toMatch(/^\$CACHE-IT_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });

  test("GenerateKey: should add a base key to a key generator and generate a key with additional parts", () => {
    const keyGenerator = CacheItUtils.addBaseKey("base");


    expect(keyGenerator)
      .toBeDefined();

    expect(keyGenerator.generateKey("my", "additional", "parts"))
      .toMatch(/^\$CACHE-IT_base_my-additional-parts_\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/);
  });
});
