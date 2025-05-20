'use client'

import { BlocksList as BlocksListFeature } from '@/features/blocks-list'
import styles from './blocks_list.module.css'

export function BlocksList() {
  return (
    <div className={styles.blocks_list_wrapper}>
      <h1 className={styles.title}>Блоки</h1>
      <BlocksListFeature />
    </div>
  )
} 