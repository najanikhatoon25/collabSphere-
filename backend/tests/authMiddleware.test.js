const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project");
const protect = require("../middleware/authMiddleware");

const secret = "auth-middleware-test-secret";
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax"
};

test("normal login takes precedence over a stale invitation session", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindUser = User.findById;
  const originalFindProject = Project.findById;
  const user = { _id: "owner-user", name: "Owner", email: "owner@example.test" };
  let nextCalled = false;
  const clearedCookies = [];
  const response = {
    clearCookie: (name, options) => clearedCookies.push({ name, options }),
    status() {
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  const request = {
    cookies: {
      token: jwt.sign({ id: user._id }, secret),
      inviteSession: jwt.sign(
        {
          type: "project-invite",
          projectId: "another-project",
          memberId: "another-member"
        },
        secret
      )
    }
  };

  process.env.JWT_SECRET = secret;
  User.findById = () => ({ select: async () => user });
  Project.findById = async () => {
    throw new Error("Invitation should not be loaded when login is valid");
  };

  try {
    await protect(
      request,
      response,
      () => {
        nextCalled = true;
      }
    );

    assert.equal(nextCalled, true);
    assert.equal(request.user, user);
    assert.equal(request.inviteSession, undefined);
    assert.equal(response.body, undefined);
    assert.equal(clearedCookies.length, 1);
    assert.equal(clearedCookies[0].name, "inviteSession");
    assert.deepEqual(clearedCookies[0].options, cookieOptions);
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
    User.findById = originalFindUser;
    Project.findById = originalFindProject;
  }
});

test("accepted invitation session still authenticates when there is no login token", async () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalFindProject = Project.findById;
  const member = {
    _id: "member-record",
    name: "Collaborator",
    email: "collaborator@example.test",
    status: "accepted"
  };
  const project = {
    _id: "shared-project",
    members: {
      id: (memberId) => memberId === member._id ? member : null
    }
  };
  let nextCalled = false;

  process.env.JWT_SECRET = secret;
  Project.findById = async () => project;

  try {
    await protect(
      {
        cookies: {
          inviteSession: jwt.sign(
            {
              type: "project-invite",
              projectId: project._id,
              memberId: member._id
            },
            secret
          )
        }
      },
      {
        clearCookie() {},
        status() {
          return this;
        },
        json(body) {
          this.body = body;
          return this;
        }
      },
      () => {
        nextCalled = true;
      }
    );

    assert.equal(nextCalled, true);
  } finally {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
    Project.findById = originalFindProject;
  }
});
