/**
 * Party Management System for Labyrinth of the Dragon
 */

export interface PartyMember {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  experience: number;
  isAlive: boolean;
  portrait?: string;
}

export interface PartyFormation {
  frontRow: string[];
  backRow: string[];
}

export class PartySystem {
  private members: Map<string, PartyMember>;
  private activeParty: string[];
  private reserves: string[];
  private maxPartySize: number;
  private formation: PartyFormation;
  private leader: string | null;

  constructor(maxPartySize: number = 4) {
    this.members = new Map();
    this.activeParty = [];
    this.reserves = [];
    this.maxPartySize = maxPartySize;
    this.formation = { frontRow: [], backRow: [] };
    this.leader = null;
  }

  /**
   * Add member to party system
   */
  addMember(member: PartyMember): boolean {
    if (this.members.has(member.id)) {
      console.warn(`Member ${member.name} already exists`);
      return false;
    }

    this.members.set(member.id, member);

    // Add to active party if space available
    if (this.activeParty.length < this.maxPartySize) {
      this.activeParty.push(member.id);
      
      // Set as leader if first member
      if (!this.leader) {
        this.leader = member.id;
      }
    } else {
      // Add to reserves
      this.reserves.push(member.id);
    }

    return true;
  }

  /**
   * Remove member from party
   */
  removeMember(memberId: string): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    // Remove from active party
    const activeIndex = this.activeParty.indexOf(memberId);
    if (activeIndex !== -1) {
      this.activeParty.splice(activeIndex, 1);

      // Replace with reserve if available
      if (this.reserves.length > 0) {
        const reserveId = this.reserves.shift()!;
        this.activeParty.push(reserveId);
      }

      // Change leader if removed
      if (this.leader === memberId) {
        this.leader = this.activeParty.length > 0 ? this.activeParty[0] : null;
      }
    }

    // Remove from reserves
    const reserveIndex = this.reserves.indexOf(memberId);
    if (reserveIndex !== -1) {
      this.reserves.splice(reserveIndex, 1);
    }

    // Remove from formation
    this.formation.frontRow = this.formation.frontRow.filter(id => id !== memberId);
    this.formation.backRow = this.formation.backRow.filter(id => id !== memberId);

    // Remove from members
    this.members.delete(memberId);

    return true;
  }

  /**
   * Swap active member with reserve
   */
  swapMember(activeMemberId: string, reserveMemberId: string): boolean {
    const activeIndex = this.activeParty.indexOf(activeMemberId);
    const reserveIndex = this.reserves.indexOf(reserveMemberId);

    if (activeIndex === -1 || reserveIndex === -1) {
      console.error('Invalid member IDs for swap');
      return false;
    }

    // Perform swap
    this.activeParty[activeIndex] = reserveMemberId;
    this.reserves[reserveIndex] = activeMemberId;

    // Update formation
    const frontIndex = this.formation.frontRow.indexOf(activeMemberId);
    const backIndex = this.formation.backRow.indexOf(activeMemberId);

    if (frontIndex !== -1) {
      this.formation.frontRow[frontIndex] = reserveMemberId;
    }
    if (backIndex !== -1) {
      this.formation.backRow[backIndex] = reserveMemberId;
    }

    return true;
  }

  /**
   * Set party leader
   */
  setLeader(memberId: string): boolean {
    if (!this.activeParty.includes(memberId)) {
      console.error('Leader must be in active party');
      return false;
    }

    this.leader = memberId;
    return true;
  }

  /**
   * Get party leader
   */
  getLeader(): PartyMember | null {
    return this.leader ? this.members.get(this.leader) || null : null;
  }

  /**
   * Get all active party members
   */
  getActiveParty(): PartyMember[] {
    return this.activeParty
      .map(id => this.members.get(id))
      .filter(Boolean) as PartyMember[];
  }

  /**
   * Get reserve members
   */
  getReserves(): PartyMember[] {
    return this.reserves
      .map(id => this.members.get(id))
      .filter(Boolean) as PartyMember[];
  }

  /**
   * Get member by ID
   */
  getMember(memberId: string): PartyMember | undefined {
    return this.members.get(memberId);
  }

  /**
   * Get all living party members
   */
  getLivingMembers(): PartyMember[] {
    return this.getActiveParty().filter(member => member.isAlive);
  }

  /**
   * Check if entire party is defeated
   */
  isPartyDefeated(): boolean {
    return this.getLivingMembers().length === 0;
  }

  /**
   * Set party formation
   */
  setFormation(formation: PartyFormation): boolean {
    const allPositions = [...formation.frontRow, ...formation.backRow];

    // Validate all members are in active party
    for (const memberId of allPositions) {
      if (!this.activeParty.includes(memberId)) {
        console.error(`Member ${memberId} not in active party`);
        return false;
      }
    }

    this.formation = formation;
    return true;
  }

  /**
   * Get current formation
   */
  getFormation(): PartyFormation {
    return { ...this.formation };
  }

  /**
   * Heal entire party
   */
  healParty(hpAmount?: number, mpAmount?: number): void {
    for (const member of this.getActiveParty()) {
      if (hpAmount !== undefined) {
        member.hp = Math.min(member.hp + hpAmount, member.maxHp);
      } else {
        member.hp = member.maxHp;
      }

      if (mpAmount !== undefined) {
        member.mp = Math.min(member.mp + mpAmount, member.maxMp);
      } else {
        member.mp = member.maxMp;
      }
    }
  }

  /**
   * Revive fallen party members
   */
  reviveParty(): void {
    for (const member of this.getActiveParty()) {
      if (!member.isAlive) {
        member.isAlive = true;
        member.hp = Math.floor(member.maxHp * 0.5);
      }
    }
  }

  /**
   * Distribute experience to party
   */
  distributeExperience(totalExp: number): void {
    const livingMembers = this.getLivingMembers();
    if (livingMembers.length === 0) return;

    const expPerMember = Math.floor(totalExp / livingMembers.length);

    for (const member of livingMembers) {
      member.experience += expPerMember;
      
      // Check for level up (simplified)
      const expNeeded = this.getExperienceForLevel(member.level + 1);
      if (member.experience >= expNeeded) {
        this.levelUpMember(member.id);
      }
    }
  }

  /**
   * Calculate experience needed for level
   */
  private getExperienceForLevel(level: number): number {
    // Simple exponential curve: 100 * level^2
    return 100 * Math.pow(level, 2);
  }

  /**
   * Level up a party member
   */
  private levelUpMember(memberId: string): void {
    const member = this.members.get(memberId);
    if (!member) return;

    member.level++;

    // Increase stats (simplified)
    member.maxHp += Math.floor(10 + member.constitution * 0.5);
    member.maxMp += Math.floor(5 + member.intelligence * 0.3);
    member.strength += Math.floor(Math.random() * 2 + 1);
    member.dexterity += Math.floor(Math.random() * 2 + 1);
    member.constitution += Math.floor(Math.random() * 2 + 1);
    member.intelligence += Math.floor(Math.random() * 2 + 1);
    member.wisdom += Math.floor(Math.random() * 2 + 1);
    member.charisma += Math.floor(Math.random() * 2 + 1);

    // Fully heal on level up
    member.hp = member.maxHp;
    member.mp = member.maxMp;

    console.log(`${member.name} reached level ${member.level}!`);
  }

  /**
   * Get party average level
   */
  getAverageLevel(): number {
    const members = this.getActiveParty();
    if (members.length === 0) return 1;

    const totalLevel = members.reduce((sum, member) => sum + member.level, 0);
    return Math.floor(totalLevel / members.length);
  }

  /**
   * Serialize party data for saving
   */
  serialize(): string {
    const data = {
      members: Array.from(this.members.entries()),
      activeParty: this.activeParty,
      reserves: this.reserves,
      formation: this.formation,
      leader: this.leader,
      maxPartySize: this.maxPartySize
    };
    return JSON.stringify(data);
  }

  /**
   * Restore party data from save
   */
  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.members = new Map(parsed.members);
    this.activeParty = parsed.activeParty;
    this.reserves = parsed.reserves;
    this.formation = parsed.formation;
    this.leader = parsed.leader;
    this.maxPartySize = parsed.maxPartySize;
  }
}
