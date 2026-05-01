import { useState, useEffect } from "react";

interface User {
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem("dailyflow_users");
    setUsers(savedUsers ? JSON.parse(savedUsers) : []);
  };

  const handleDeleteUser = (username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"? This will also delete all their tasks.`)) {
      const updatedUsers = users.filter(u => u.username !== username);
      localStorage.setItem("dailyflow_users", JSON.stringify(updatedUsers));
      // Also delete user's tasks
      localStorage.removeItem(`dailyflow_user_tasks_${username}`);
      setUsers(updatedUsers);
    }
  };

  const getTotalTasks = (username: string) => {
    const tasks = localStorage.getItem(`dailyflow_user_tasks_${username}`);
    return tasks ? JSON.parse(tasks).length : 0;
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecentUsers = () => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 mb-2">
          User Management
        </h1>
        <p className="text-gray-200">Monitor and manage all registered users</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-pink-300/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
              <p className="text-4xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Tasks Across All Users */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-pink-300/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks Created</p>
              <p className="text-4xl font-bold text-gray-900">
                {users.reduce((sum, user) => sum + getTotalTasks(user.username), 0)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* New Users This Week */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-pink-300/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Recent Signups</p>
              <p className="text-4xl font-bold text-gray-900">
                {users.filter(u => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(u.createdAt) > weekAgo;
                }).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-pink-300/50">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Registrations
        </h2>
        <div className="space-y-3">
          {getRecentUsers().length > 0 ? (
            getRecentUsers().map(user => (
              <div key={user.username} className="flex items-center justify-between py-2 border-b border-pink-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getTotalTasks(user.username)} tasks
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No users registered yet</p>
          )}
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-pink-300/50 overflow-hidden">
        <div className="p-6 border-b border-pink-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">All Registered Users</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pink-50/80 border-b border-pink-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.username} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                        {getTotalTasks(user.username)} tasks
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {searchQuery ? "No users found matching your search" : "No users registered yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
