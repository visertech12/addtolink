'use client'

import { useEffect } from 'react'
import { BookmarkForm } from '@/components/bookmark-form'
import { CategorySection } from '@/components/category-section'
import { ErrorModal } from '@/components/error-modal'
import { CategoryModal } from '@/components/category-modal'
import { ShareModal } from '@/components/share-modal'
import { DeleteModal } from '@/components/delete-modal'
import { Toast } from '@/components/toast'
import { DragGuide } from '@/components/drag-guide'
import { useBookmarkManager } from '@/hooks/use-bookmark-manager'
import { Header } from '@/components/Header'
import '@/styles/bookmark-manager.css'

export default function BookmarkManagerPage() {
  const {
    bookmarkData,
    modals,
    toast,
    dragState,
    selectedEmoji,
    editingCategory,
    deleteTarget,
    deleteType,
    showModal,
    closeModal,
    addBookmark,
    createOrUpdateCategory,
    updateCategory,
    deleteCategory,
    deleteBookmark,
    toggleCategory,
    startEditingCategory,
    shareCategory,
    reorderCategories,
    setSelectedEmoji,
  } = useBookmarkManager()

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        addBookmark()
      }
      if (e.key === 'Escape') {
        Object.keys(modals).forEach((modalId) => {
          if (modals[modalId as keyof typeof modals]) {
            closeModal(modalId as keyof typeof modals)
          }
        })
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        showModal('categoryModal')
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [modals, closeModal, showModal, addBookmark])

  return (
    <div className="bookmark-manager">
      <Header />

      <div style={{ marginTop: '3.5rem' }}>
        <header className="bookmark-header">
          <div className="header-container">
            <h1>Bookmarks</h1>
            <p>
              <i className="fa-regular fa-bookmark"></i>
              Organize your favorite sites
              <i className="fa-regular fa-bookmark"></i>
            </p>
          </div>
        </header>
      </div>

      <DragGuide show={dragState.dragging} />

      <main className="main-wrapper">
        <div className="main-container">
          <BookmarkForm
            categories={Object.keys(bookmarkData.categories)}
            onSubmit={addBookmark}
            bookmarkData={bookmarkData}
          />

          <CategorySection
            bookmarkData={bookmarkData}
            onToggleCategory={toggleCategory}
            onEditCategory={startEditingCategory}
            onDeleteCategory={(name) =>
              showModal('deleteModal', { type: 'category', target: name, name })
            }
            onDeleteBookmark={(categoryName, index, bookmarkName) =>
              showModal('deleteModal', {
                type: 'bookmark',
                target: { category: categoryName, index },
                name: bookmarkName,
              })
            }
            onShareCategory={shareCategory}
            onCreateCategory={() => showModal('categoryModal')}
            onReorderCategories={reorderCategories}
            editingCategory={editingCategory}
            onUpdateCategory={updateCategory}
          />
        </div>
      </main>

      <ErrorModal show={modals.errorModal} onClose={() => closeModal('errorModal')} />
      <CategoryModal
        show={modals.categoryModal}
        onClose={() => closeModal('categoryModal')}
        onSave={createOrUpdateCategory}
        selectedEmoji={selectedEmoji}
        onEmojiSelect={setSelectedEmoji}
        editingCategory={editingCategory}
      />
      <ShareModal
        show={modals.shareCategoryModal}
        onClose={() => closeModal('shareCategoryModal')}
        categoryName={deleteTarget?.name || ''}
        shareUrl={deleteTarget?.shareUrl || ''}
      />
      <DeleteModal
        show={modals.deleteModal}
        onClose={() => closeModal('deleteModal')}
        onConfirm={() => {
          if (deleteType === 'category') deleteCategory(deleteTarget)
          else if (deleteType === 'bookmark') deleteBookmark(deleteTarget.category, deleteTarget.index)
          closeModal('deleteModal')
        }}
        type={deleteType}
        target={deleteTarget}
        bookmarkCount={
          deleteType === 'category' && deleteTarget
            ? bookmarkData.categories[deleteTarget]?.length || 0
            : 0
        }
      />
      <Toast show={toast.show} message={toast.message} type={toast.type} />
    </div>
  )
}
