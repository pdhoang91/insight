'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check } from '@phosphor-icons/react';
import { useCategories } from '../../hooks/useCategories';
import { createCategory } from '../../services/categoryService';
import { isAdmin } from '../../constants/roles';
import { useUser } from '../../context/UserContext';
import { Spinner } from '../UI/Loading';

const spring = { type: 'spring', stiffness: 100, damping: 20 };
const VALID_CATEGORY_NAME = /^[\p{L}\p{N}\s\-_.]+$/u;

const SkeletonChip = ({ width = '5rem' }) => (
  <div
    style={{
      height: '2rem',
      width,
      borderRadius: '3px',
      background: 'var(--bg-elevated)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, var(--bg-surface) 50%, transparent 100%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer-warm 1.5s ease-in-out infinite',
      }}
    />
  </div>
);

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'var(--font-display)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    margin: 0,
  }}>
    {children}
  </p>
);

/**
 * @param {{ selected: object[], onChange: (categories: object[]) => void }} props
 */
const CategorySelector = ({ selected, onChange }) => {
  const { user } = useUser();
  const { categories, isLoading, mutate: mutateCategories } = useCategories();
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  const userIsAdmin = isAdmin(user?.role);

  const toggle = (category) => {
    const isSelected = selected.some(c => c.id === category.id);
    if (isSelected) {
      onChange(selected.filter(c => c.id !== category.id));
    } else if (selected.length < 3) {
      onChange([...selected, category]);
    }
  };

  const handleCreate = async () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    if (name.length < 2) { setCreateError('Name must be at least 2 characters'); return; }
    if (name.length > 100) { setCreateError('Name must be 100 characters or less'); return; }
    if (!VALID_CATEGORY_NAME.test(name)) {
      setCreateError('No special characters allowed (letters, numbers, spaces, - _ . only)');
      return;
    }
    setIsCreating(true);
    setCreateError('');
    try {
      const created = await createCategory(name);
      await mutateCategories();
      setNewCategoryInput('');
      setShowNewInput(false);
      if (selected.length < 3) {
        onChange([...selected, created]);
      }
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create category');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <SectionLabel>Categories</SectionLabel>

        {userIsAdmin && (
          <motion.button
            onClick={() => { setShowNewInput(v => !v); setCreateError(''); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: showNewInput ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none',
              border: '1px solid',
              borderColor: showNewInput ? 'var(--accent)' : 'var(--border)',
              borderRadius: '3px',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
              transition: 'all 0.2s',
            }}
            className="hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={11} weight="bold" />
            New
          </motion.button>
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        marginBottom: '1rem',
        lineHeight: 1.5,
      }}>
        {userIsAdmin
          ? 'Select or create categories (up to 3).'
          : 'Add up to 3 categories so readers know what your story is about.'}
      </p>

      <AnimatePresence>
        {userIsAdmin && showNewInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={spring}
            style={{ overflow: 'hidden', marginBottom: '0.75rem' }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Category name..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  border: '1px solid var(--border-mid)',
                  borderRadius: '3px',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
                className="focus:border-[var(--accent)] placeholder:text-[var(--text-faint)]"
              />
              <motion.button
                onClick={handleCreate}
                disabled={!newCategoryInput.trim() || isCreating}
                whileTap={{ scale: 0.95, y: 1 }}
                transition={spring}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: newCategoryInput.trim() ? 'var(--accent)' : 'var(--bg-surface)',
                  color: newCategoryInput.trim() ? 'var(--text-inverse)' : 'var(--text-faint)',
                  border: 'none',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: newCategoryInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {isCreating ? <Spinner size="xs" /> : <Check size={13} weight="bold" />}
                Add
              </motion.button>
            </div>
            {createError && (
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                color: '#DC2626',
                marginTop: '0.375rem',
              }}>
                {createError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <SkeletonChip key={i} width={`${4 + (i % 3)}rem`} />
          ))}
        </div>
      ) : (
        <motion.div
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } },
            hidden: {},
          }}
        >
          {categories?.map((cat) => {
            const isSelected = selected.some(c => c.id === cat.id);
            const isDisabled = !isSelected && selected.length >= 3;
            return (
              <motion.button
                key={cat.id}
                layout
                layoutId={`cat-${cat.id}`}
                onClick={() => !isDisabled && toggle(cat)}
                disabled={isDisabled}
                variants={{
                  hidden: { opacity: 0, scale: 0.85 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={!isDisabled ? { scale: 1.04 } : {}}
                whileTap={!isDisabled ? { scale: 0.96, y: 1 } : {}}
                transition={spring}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  borderRadius: '3px',
                  border: `1px solid ${isSelected ? 'var(--accent)' : isDisabled ? 'var(--border)' : 'var(--border-mid)'}`,
                  background: isSelected ? 'var(--accent)' : 'transparent',
                  color: isSelected ? 'var(--text-inverse)' : isDisabled ? 'var(--text-faint)' : 'var(--text-muted)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  letterSpacing: '-0.01em',
                }}
                className={!isSelected && !isDisabled ? 'hover:border-[var(--accent)] hover:text-[var(--accent)]' : ''}
              >
                {cat.name}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={spring}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            color: 'var(--text-faint)',
            marginTop: '0.75rem',
          }}
        >
          {selected.length}/3 selected
        </motion.p>
      )}
    </div>
  );
};

export default CategorySelector;
