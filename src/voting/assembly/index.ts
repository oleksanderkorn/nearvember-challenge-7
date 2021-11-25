import {
  PersistentSet,
  context,
  u128,
  PersistentMap,
  RNG,
} from "near-sdk-core";
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
class Election {
  public candidates: PersistentSet<Candidate>;
  public candidateIds: PersistentSet<string>;
  public votes: PersistentMap<AccountId, PersistentSet<Vote>>;
  public voters: PersistentSet<AccountId>;
  public electionInfo: ElectionInfo;

  constructor(
    id: u32,
    initiator: AccountId,
    creationDate: Timestamp,
    startDate: Timestamp,
    endDate: Timestamp,
    title: string,
    description: string
  ) {
    this.electionInfo = new ElectionInfo(
      id,
      initiator,
      creationDate,
      startDate,
      endDate,
      title,
      description
    );
    this.candidates = new PersistentSet<Candidate>(`e${id}_c`);
    this.votes = new PersistentMap<AccountId, PersistentSet<Vote>>(`e${id}_v`);
    this.candidateIds = new PersistentSet<string>(`e${id}_ci`);
    this.voters = new PersistentSet<AccountId>(`e${id}_vt`);
  }
}

@nearBindgen
class ElectionInfo {
  constructor(
    public id: u32,
    public initiator: AccountId,
    public creationDate: Timestamp,
    public startDate: Timestamp,
    public endDate: Timestamp,
    public title: string,
    public description: string
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
class ElectionVotes {
  constructor(public election: ElectionInfo, public votes: CandidateVotes[]) {}
}

@nearBindgen
export class Contract {
  private elections: PersistentMap<u32, Election>;
  private electionIds: PersistentSet<u32>;

  constructor() {
    this.elections = new PersistentMap<u32, Election>("e");
    this.electionIds = new PersistentSet<u32>("ei");
  }

  get_elections(): ElectionInfo[] {
    const electionIds = this.electionIds.values();
    let elections: ElectionInfo[] = [];
    for (let i: i32 = 0; i < electionIds.length; i++) {
      elections.push(this.elections.getSome(electionIds[i]).electionInfo);
    }
    return elections;
  }

  get_candidates(electionId: u32): Candidate[] {
    assert(
      this.elections.contains(electionId),
      `No election with id [${electionId}] found. Did you mistype?`
    );
    return this.elections.getSome(electionId).candidates.values();
  }

  /**
   * @returns List of candidates with votes.
   */
  get_votes(electionId: u32): ElectionVotes {
    assert(
      this.elections.contains(electionId),
      `No election with id [${electionId}] found. Did you mistype?`
    );
    const election = this.elections.getSome(electionId);
    const allCandidates = election.candidates.values();
    const candidatesVotes: CandidateVotes[] = [];
    for (let i: i32 = 0; i < allCandidates.length; i++) {
      const candidate = allCandidates[i];
      let votes: Vote[];
      if (election.votes.contains(candidate.accountId)) {
        votes = election.votes.getSome(candidate.accountId).values();
      } else {
        votes = [];
      }
      const candidateVote = new CandidateVotes(candidate, votes);
      candidatesVotes.push(candidateVote);
    }
    return new ElectionVotes(election.electionInfo, candidatesVotes);
  }

  @mutateState()
  add_election(title: string, description: string): void {
    const rng = new RNG<u32>(1, u32.MAX_VALUE);
    const electionId = rng.next();
    const election = new Election(
      electionId,
      context.sender,
      context.blockTimestamp,
      context.blockTimestamp + 86400000000000, // TODO pass startDate as argument
      context.blockTimestamp + 86400000000000 * 7, // TODO pass endDate as argument
      title,
      description
    );
    this.electionIds.add(electionId);
    this.elections.set(electionId, election);
  }

  @mutateState()
  add_candidacy(
    electionId: u32,
    name: string,
    slogan: string,
    goals: string
  ): void {
    const candidateId = context.sender;
    assert(
      this.elections.contains(electionId),
      `No election with id [${electionId}] found. Did you mistype?`
    );
    const election = this.elections.getSome(electionId);
    assert(
      election.electionInfo.startDate > context.blockTimestamp,
      "Could not add candidacy to the ongoing elections."
    );
    assert(
      !election.candidateIds.has(candidateId),
      "Candidate is already registered in this election, dont cheat! Your votes will not sum up in case you register yourself twice :)"
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
    election.candidates.add(candidate);
    election.candidateIds.add(candidateId);
    this.elections.set(electionId, election);
  }

  @mutateState()
  add_vote(electionId: u32, candidateId: string, comment: string): void {
    assert(
      this.elections.contains(electionId),
      `No election with id [${electionId}] found. Did you mistype?`
    );
    const election = this.elections.getSome(electionId);
    assert(
      election.electionInfo.startDate > context.blockTimestamp,
      "Could not add vote to the election which is not yet started."
    );
    assert(
      election.electionInfo.endDate < context.blockTimestamp,
      "Could not add vote to the election which is already finished."
    );
    const voterId = context.sender;
    const date = context.blockTimestamp;
    const donation = context.attachedDeposit;
    assert(
      election.candidateIds.has(candidateId),
      "Candidate is not registered in the election. Maybe you mistyped his account id?"
    );

    assert(!election.voters.has(voterId), "Sorry, you can only vote once!");
    election.voters.add(voterId);
    const vote = new Vote(
      voterId,
      date,
      candidateId,
      comment ? comment : "",
      donation
    );

    let votes = election.votes.get(candidateId);
    if (votes == null) {
      votes = new PersistentSet<Vote>("vt");
    }
    votes.add(vote);
    election.votes.set(candidateId, votes);
    this.elections.set(electionId, election);
  }
}
