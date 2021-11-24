import { Contract } from "../assembly";

let contract: Contract;

beforeEach(() => {
  contract = new Contract();
});

describe("Contract", () => {
  // VIEW method tests

  it("should get empty candidates list", () => {
    expect(contract.get_candidates()).toStrictEqual([]);
  });

  // it("Should fail with empty name", () => {
  //   expect(contract.add_candidacy("", "Slogan", "Programm")).toThrow(
  //     "Candidate is already registered, dont cheat! Your votes will not sum up in case you register yourself twice :)"
  //   );
  // });

  // // CHANGE method tests

  // it("saves data to contract storage", () => {
  //   expect(contract.write("some-key", "some value")).toStrictEqual("✅ Data saved. ( storage [ 18 bytes ] )")
  // })
});
