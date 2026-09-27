import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetails } from './pages/GroupDetails';
import { Friends } from './pages/Friends';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { SettleUpModal } from './components/SettleUpModal';
import axiosInstance from './api/axiosInstance';

export function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Global Modal States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

  // Modal contextual presets
  const [selectedGroupPreset, setSelectedGroupPreset] = useState(null);
  const [selectedFriendPreset, setSelectedFriendPreset] = useState(null);
  const [editingExpenseData, setEditingExpenseData] = useState(null);
  const [settlePayerPreset, setSettlePayerPreset] = useState(null);
  const [settleReceiverPreset, setSettleReceiverPreset] = useState(null);
  const [settleAmountPreset, setSettleAmountPreset] = useState(0);

  // App-wide reference lists for dropdowns
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);

  const loadReferenceData = async () => {
    if (!user) return;
    try {
      const [gRes, fRes] = await Promise.all([
        axiosInstance.get('/groups'),
        axiosInstance.get('/friends')
      ]);
      setGroups(gRes.data);
      setFriends(fRes.data);
    } catch (err) {
      console.error('Failed to load reference data:', err);
    }
  };

  useEffect(() => {
    loadReferenceData();
  }, [user]);

  const handleOpenAddExpense = (group = null, friend = null, expenseData = null) => {
    setSelectedGroupPreset(group);
    setSelectedFriendPreset(friend);
    setEditingExpenseData(expenseData);
    setIsAddExpenseOpen(true);
  };

  const handleOpenSettleUp = (group = null, payer = null, receiver = null, amount = 0) => {
    setSelectedGroupPreset(group);
    setSettlePayerPreset(payer);
    setSettleReceiverPreset(receiver);
    setSettleAmountPreset(amount);
    setIsSettleUpOpen(true);
  };

  const handleModalSuccess = () => {
    loadReferenceData();
    // Refresh current view if needed
    window.dispatchEvent(new Event('refresh-data'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Bar */}
      <Navbar
        onOpenAddExpense={() => handleOpenAddExpense()}
        onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard
                  onOpenAddExpense={(grp) => handleOpenAddExpense(grp)}
                  onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                  onOpenSettleUp={() => handleOpenSettleUp()}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/groups"
            element={
              user ? (
                <Groups onOpenCreateGroup={() => setIsCreateGroupOpen(true)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/group/:id"
            element={
              user ? (
                <GroupDetails
                  onOpenAddExpense={(grp) => handleOpenAddExpense(grp)}
                  onOpenSettleUpWithPreset={(grp, p, r, a) => handleOpenSettleUp(grp, p, r, a)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/friends"
            element={
              user ? (
                <Friends
                  onOpenAddExpense={(grp, fr) => handleOpenAddExpense(grp, fr)}
                  onOpenSettleUpWithPreset={(grp, p, r, a) => handleOpenSettleUp(grp, p, r, a)}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800/60 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-300">SplitEase</span>
            <span>— Splitwise Clone built with MERN Stack & Debt Simplification</span>
          </div>
          <div>Powered by Node.js, Express, MongoDB & React Vite</div>
        </div>
      </footer>

      {/* Global Modals */}
      {user && (
        <>
          <ExpenseFormModal
            isOpen={isAddExpenseOpen}
            onClose={() => setIsAddExpenseOpen(false)}
            groups={groups}
            friends={friends}
            defaultGroup={selectedGroupPreset}
            defaultFriend={selectedFriendPreset}
            initialData={editingExpenseData}
            onSuccess={handleModalSuccess}
            currentUserId={user._id}
          />

          <CreateGroupModal
            isOpen={isCreateGroupOpen}
            onClose={() => setIsCreateGroupOpen(false)}
            onSuccess={(newGroup) => {
              handleModalSuccess();
              navigate(`/group/${newGroup._id}`);
            }}
          />

          <SettleUpModal
            isOpen={isSettleUpOpen}
            onClose={() => setIsSettleUpOpen(false)}
            group={selectedGroupPreset}
            friends={friends}
            suggestedPayer={settlePayerPreset}
            suggestedReceiver={settleReceiverPreset}
            suggestedAmount={settleAmountPreset}
            onSuccess={handleModalSuccess}
            currentUserId={user._id}
          />
        </>
      )}
    </div>
  );
}

export default App;
