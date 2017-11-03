/** Copyright (c) 2017 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = robot => {
  robot.on('pull_request.opened', check);
  robot.on('pull_request.reopened', check);
  robot.on('pull_request.edited', check);
  robot.on('pull_request.synchronized', check);

  async function check(context) {
    const {github} = context;
    const pr = context.payload.pull_request;

    setStatus({
      state: 'pending',
      description: 'Checking if repo has a LICENSE',
    });

    async function hasLicense() {
      try {
        const res = await context.github.repos.getContent(
          context.repo({
            path: `LICENSE`,
          }),
        );
        const content = Buffer.from(res.data.content, 'base64').toString();
        return content && content.length > 0;
      } catch (e) {
        return false;
      }
    }

    const status = await hasLicense()
      ? {
          state: 'success',
          description: 'Repo has a LICENSE file',
        }
      : {
          state: 'failure',
          description: 'Repo does not have a LICENSE file',
        };

    setStatus(status);

    function setStatus(status) {
      const params = Object.assign(
        {
          sha: pr.head.sha,
          context: 'probot/pr-license',
        },
        status,
      );
      return github.repos.createStatus(context.repo(params));
    }
  }
};
