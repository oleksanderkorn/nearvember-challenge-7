import { PersistentSet, context, u128, PersistentMap } from "near-sdk-core";
import { AccountId, Timestamp } from "../../utils";

@nearBindgen
class Candidate {
  constructor(
    public accountId: AccountId,
    public registrationDate: Timestamp,
    public name: string,
    public slogan: string,
    public goals: string
  ) {}
}

@nearBindgen
class Vote {
  constructor(
    public accountId: AccountId,
    public date: Timestamp,
    public candidateId: AccountId,
    public comment: string,
    public donation: u128
  ) {}
}

@nearBindgen
class CandidateVotes {
  constructor(public candidate: Candidate, public votes: Vote[]) {}
}

@nearBindgen
export class Contract {
  private candidates: PersistentSet<Candidate>;
  private candidateIds: PersistentSet<string>;
  private votes: PersistentMap<AccountId, PersistentSet<Vote>>;
  private voters: PersistentSet<AccountId>;

  constructor() {
    this.candidates = new PersistentSet<Candidate>("c");
    this.votes = new PersistentMap<AccountId, PersistentSet<Vote>>("v");
    this.candidateIds = new PersistentSet<string>("ci");
    this.voters = new PersistentSet<AccountId>("vt");
  }

  get_candidates(): Candidate[] {
    return this.candidates.values();
  }

  /**
   * @returns List of candidates with votes.
   */
  get_votes(): CandidateVotes[] {
    const allCandidates = this.candidates.values();
    const candidatesVotes: CandidateVotes[] = [];
    for (let i: i32 = 0; i < allCandidates.length; i++) {
      const candidate = allCandidates[i];
      let votes: Vote[];
      if (this.votes.contains(candidate.accountId)) {
        votes = this.votes.getSome(candidate.accountId).values();
      } else {
        votes = [];
      }
      const candidateVote = new CandidateVotes(candidate, votes);
      candidatesVotes.push(candidateVote);
    }
    return candidatesVotes;
  }

  @mutateState()
  add_candidacy(name: string, slogan: string, goals: string): void {
    const candidateId = context.sender;
    assert(
      !this.candidateIds.has(candidateId),
      "Candidate is already registered, dont cheat! Your votes will not sum up in case you register yourself twice :)"
    );
    assert(
      name.length > 0,
      "Name is required, put your account ID as name if you was us to put it on the election billboard!"
    );
    assert(
      slogan.length > 0,
      "Slogan is required, what are you going to print on the snapbacks abd t-shirts?"
    );
    assert(
      goals.length > 0,
      "Goals is required, who will vote to you withouth "
    );

    const date = context.blockTimestamp;
    const candidate = new Candidate(candidateId, date, name, slogan, goals);
    this.candidates.add(candidate);
    this.candidateIds.add(candidateId);
  }

  @mutateState()
  add_vote(candidateId: string, comment: string): void {
    const voterId = context.sender;
    const date = context.blockTimestamp;
    const donation = context.attachedDeposit;
    assert(
      this.candidateIds.has(candidateId),
      "Candidate is not registered in the election. Maybe you mistyped his account id?"
    );

    assert(!this.voters.has(voterId), "Sorry, you can only vote once!");
    this.voters.add(voterId);
    const vote = new Vote(
      voterId,
      date,
      candidateId,
      comment ? comment : "",
      donation
    );

    let votes = this.votes.get(candidateId);
    if (votes == null) {
      votes = new PersistentSet<Vote>("vt");
    }
    votes.add(vote);
    this.votes.set(candidateId, votes);
  }
}
