const axios = require('axios');

/**
 * Auto-raises a Jira defect when a test fails.
 * Industry-standard pattern: dedupe by summary so re-runs of the same
 * failing test don't spam Jira with duplicate tickets — instead we
 * search first, and only create if no open ticket with that title exists.
 */
class JiraDefectLogger {
  constructor() {
    this.enabled = process.env.JIRA_ENABLED === 'true';
    this.baseUrl = process.env.JIRA_BASE_URL;
    this.auth = {
      username: process.env.JIRA_EMAIL,
      password: process.env.JIRA_API_TOKEN,
    };
    this.projectKey = process.env.JIRA_PROJECT_KEY || 'QA';
    this.issueType = process.env.JIRA_ISSUE_TYPE || 'Bug';
  }

  async logDefect({ testTitle, specFile, errorMessage, errorStack, screenshotBase64 }) {
    if (!this.enabled) return null;

    try {
      const summary = `[Automation] ${testTitle}`.substring(0, 250);

      const existing = await this._findExisting(summary);
      if (existing) {
        console.log(`[Jira] Open defect already exists: ${existing}`);
        return existing;
      }

      const payload = {
        fields: {
          project: { key: this.projectKey },
          summary,
          issuetype: { name: this.issueType },
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: `Automated test failure detected.\n\n` +
                      `Spec file: ${specFile}\n` +
                      `Error: ${errorMessage}\n\n` +
                      `Stack trace:\n${(errorStack || '').substring(0, 1500)}` },
                ],
              },
            ],
          },
          labels: ['automation', 'wdio'],
        },
      };

      const res = await axios.post(
        `${this.baseUrl}/rest/api/3/issue`,
        payload,
        { auth: this.auth, headers: { 'Content-Type': 'application/json' } }
      );

      const issueKey = res.data.key;
      console.log(`[Jira] Created defect: ${issueKey}`);

      if (screenshotBase64) {
        await this._attachScreenshot(issueKey, screenshotBase64);
      }

      return issueKey;
    } catch (err) {
      // Never let defect logging crash the test run
      console.error('[Jira] Failed to log defect:', err.message);
      return null;
    }
  }

  async _findExisting(summary) {
    const jql = `project = ${this.projectKey} AND summary ~ "${summary.replace(/"/g, '')}" AND status != Done`;
    const res = await axios.get(`${this.baseUrl}/rest/api/3/search`, {
      auth: this.auth,
      params: { jql, maxResults: 1 },
    });
    return res.data.issues?.[0]?.key || null;
  }

  async _attachScreenshot(issueKey, base64) {
    const buffer = Buffer.from(base64, 'base64');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', buffer, { filename: 'failure.png', contentType: 'image/png' });

    await axios.post(
      `${this.baseUrl}/rest/api/3/issue/${issueKey}/attachments`,
      form,
      {
        auth: this.auth,
        headers: { ...form.getHeaders(), 'X-Atlassian-Token': 'no-check' },
      }
    );
  }
}

module.exports = new JiraDefectLogger();
