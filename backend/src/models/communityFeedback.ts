import { QueryResult } from 'pg';
import db from '../config/database';
import { CommunityComment, CommunityVote, CommunityFeedback, VoteTotals } from '../types/urlScan';

export class CommunityFeedbackModel {
  /**
   * Save community feedback for a URL scan
   */
  public async saveFeedback(scanId: string, feedback: CommunityFeedback): Promise<void> {
    const query = `
      INSERT INTO community_feedback (
        scan_id, 
        comments, 
        votes, 
        total_votes, 
        total_comments, 
        total_votes_count
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (scan_id) DO UPDATE
      SET 
        comments = $2, 
        votes = $3, 
        total_votes = $4, 
        total_comments = $5,
        total_votes_count = $6;
    `;

    await db.query(query, [
      scanId,
      JSON.stringify(feedback.comments),
      JSON.stringify(feedback.votes),
      JSON.stringify(feedback.totalVotes),
      feedback.totalComments,
      feedback.totalVotesCount
    ]);
  }

  /**
   * Get community feedback for a URL scan
   */
  public async getFeedback(scanId: string): Promise<CommunityFeedback | null> {
    const query = `
      SELECT 
        comments, 
        votes, 
        total_votes, 
        total_comments, 
        total_votes_count
      FROM community_feedback
      WHERE scan_id = $1;
    `;

    const result: QueryResult = await db.query(query, [scanId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      comments: row.comments,
      votes: row.votes,
      totalVotes: row.total_votes,
      totalComments: row.total_comments,
      totalVotesCount: row.total_votes_count
    };
  }
}
