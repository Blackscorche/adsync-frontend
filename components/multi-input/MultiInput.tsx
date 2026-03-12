import React, { useState, useMemo } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDownIcon, SearchIcon } from 'lucide-react'

export interface SearchCategory {
  value: string
  label: string
}

export interface SearchItem {
  id: string | number
  label: string
  value: string
}

export interface FilterableSearchInputProps {
  categories: SearchCategory[]
  data: Record<string, SearchItem[]>
  onSelect?: (item: SearchItem) => void
}

export const FilterableSearchInput = ({
  categories,
  data,
  onSelect,
}: FilterableSearchInputProps) => {
  const [searchCategory, setSearchCategory] = useState(categories[0]?.value || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchCleared, setIsSearchClear] = useState(false)

  const selectedCategoryLabel = useMemo(
    () => categories.find((c) => c.value === searchCategory)?.label,
    [searchCategory, categories]
  )

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return []
    }
    const dataToSearch = data[searchCategory] || []
    return dataToSearch.filter((item) =>
      item.value.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
  }, [searchTerm, searchCategory, data, searchCategory])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #E2E8F0',
          borderRadius: '6px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          width: '100%',
          maxWidth: '450px',
        }}
      >
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 15px',
                fontSize: '14px',
                lineHeight: '1',
                height: '38px',
                gap: '5px',
                backgroundColor: '#F8F9FA',
                color: '#4A5568',
                border: 'none',
                borderRight: '1px solid #E2E8F0',
                borderRadius: '5px 0 0 5px',
                cursor: 'pointer',
                outline: 'none',
              }}
              aria-label="Select Search Category"
            >
              {selectedCategoryLabel}
              <ChevronDownIcon size={16} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              style={{ ...styles.content, minWidth: '150px' }}
              sideOffset={5}
            >
              {categories.map((category) => (
                <DropdownMenu.Item
                  key={category.value}
                  style={styles.item}
                  onSelect={() => setSearchCategory(category.value)}
                >
                  {category.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '10px',
            flexGrow: 1,
            backgroundColor: 'white',
            borderRadius: '0 5px 5px 0',
          }}
        >
          <SearchIcon style={{ marginRight: 8, color: '#A0AEC0' }} size={16} />
          <input
            type="text"
            placeholder={`Search in ${selectedCategoryLabel}...`}
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value)
                setIsSearchClear(false)
            }}
            style={{
              all: 'unset',
              height: '38px',
              minWidth: '200px',
              fontSize: '14px',
              paddingRight: '10px',
              boxSizing: 'border-box',
            }}
          />
        </div>
        {searchTerm && !isSearchCleared && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 10,
              overflow: 'hidden',
            }}
          >
            {searchResults.length > 0 ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {searchResults.map((result) => (
                  <li
                    key={`${result.id}-${result.value}`}
                    style={{
                      padding: '10px 15px',
                      fontSize: '14px',
                      color: '#4A5568',
                      borderBottom: '1px solid #F7FAFC',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget.style.backgroundColor = '#F7FAFC')
                    }}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'white')
                    }
                    onClick={() => {
                      setSearchTerm(result.label)
                      setIsSearchClear(true)
                      if (onSelect) onSelect(result)
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#2D3748' }}>
                      {result.label}
                    </span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      {result.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                style={{
                  padding: '10px 15px',
                  fontSize: '14px',
                  color: '#A0AEC0',
                }}
              >
                No results found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  content: {
    backgroundColor: 'white',
    borderRadius: '6px',
    padding: '5px',
    boxShadow:
      '0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)',
    zIndex: 100,
  },
  item: {
    fontSize: '14px',
    lineHeight: '1',
    color: '#333',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    height: '30px',
    padding: '0 10px',
    position: 'relative' as const,
    userSelect: 'none' as const,
    cursor: 'default',
    outline: 'none',
  },
}
