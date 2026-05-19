import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  increment, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';

function App() {
  const [pollOptions, setPollOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'poll'), orderBy('upvotes', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const optionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPollOptions(optionsData);
    });

    return () => unsubscribe();
  }, []);

  const handleAddOption = async (e) => {
    e.preventDefault();
    if (newOption.trim() === '') return;

    await addDoc(collection(db, 'poll'), {
      text: newOption,
      upvotes: 0
    });

    setNewOption('');
  };

  const handleUpvote = async (id) => {
    const optionRef = doc(db, 'poll', id);
    
    await updateDoc(optionRef, {
      upvotes: increment(1)
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Does pineapple belong on pizza?</h2>

      <form onSubmit={handleAddOption} style={{ marginBottom: '2rem', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder="e.g., Absolutely yes"
          style={{ flexGrow: 1, padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Submit Option</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pollOptions.map((option) => (
          <div 
            key={option.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{option.text}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: 'bold' }}>{option.upvotes} votes</span>
              <button 
                onClick={() => handleUpvote(option.id)}
                style={{ cursor: 'pointer', padding: '5px 10px' }}
              >
                Upvote 👍
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;