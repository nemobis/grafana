import React, { useState } from 'react';
import { css } from '@emotion/css';
import classNames from 'classnames';
import { GrafanaTheme2 } from '@grafana/data';
import { Icon, Spinner, TagList, useTheme2 } from '@grafana/ui';
import { DashboardSectionItem } from '../types';
import { getThumbnailURL } from './SearchCard';

export interface Props {
  className?: string;
  imageHeight: number;
  imageWidth: number;
  item: DashboardSectionItem;
  lastUpdated?: string;
}

export function SearchCardExpanded({ className, imageHeight, imageWidth, item, lastUpdated }: Props) {
  const NUM_IMAGE_RETRIES = 5;
  const IMAGE_RETRY_DELAY = 10000;

  const theme = useTheme2();
  const [hasImage, setHasImage] = useState(true);
  const imageSrc = getThumbnailURL(item.uid!, theme.isLight);
  const styles = getStyles(theme, imageHeight, imageWidth);

  const retryImage = (remainingRetries: number) => {
    return () => {
      if (remainingRetries > 0) {
        if (hasImage) {
          setHasImage(false);
        }
        window.setTimeout(() => {
          const img = new Image();
          img.onload = () => setHasImage(true);
          img.onerror = retryImage(remainingRetries - 1);
          img.src = imageSrc;
        }, IMAGE_RETRY_DELAY);
      }
    };
  };

  const folderTitle = item.folderTitle || 'General';

  return (
    <a className={classNames(className, styles.card)} key={item.uid} href={item.url}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img
            loading="lazy"
            className={styles.image}
            src={imageSrc}
            onLoad={() => setHasImage(true)}
            onError={retryImage(NUM_IMAGE_RETRIES)}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Icon name="apps" size="xl" />
          </div>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.infoHeader}>
          <div className={styles.titleContainer}>
            <div>{item.title}</div>
            <div className={styles.folder}>
              <Icon name={'folder'} />
              {folderTitle}
            </div>
          </div>
          <div className={styles.updateContainer}>
            <div>Last updated</div>
            {lastUpdated ? <div className={styles.update}>{lastUpdated}</div> : <Spinner />}
          </div>
        </div>
        <div>
          <TagList className={styles.tagList} tags={item.tags} />
        </div>
      </div>
    </a>
  );
}

const getStyles = (theme: GrafanaTheme2, imageHeight: Props['imageHeight'], imageWidth: Props['imageWidth']) => ({
  card: css`
    background-color: ${theme.colors.background.secondary};
    border: 1px solid ${theme.colors.border.medium};
    border-radius: 4px;
    box-shadow: ${theme.shadows.z3};
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: calc(${imageWidth}px + (${theme.spacing(4)} * 2))};
    width: 100%;
  `,
  folder: css`
    align-items: center;
    color: ${theme.colors.text.secondary};
    display: flex;
    font-size: ${theme.typography.size.sm};
    gap: ${theme.spacing(0.5)};
  `,
  image: css`
    box-shadow: ${theme.shadows.z3};
    height: ${imageHeight}px;
    margin: ${theme.spacing(1)} calc(${theme.spacing(4)} - 1px) 0;
    width: ${imageWidth}px;
  `,
  imageContainer: css`
    flex: 1;
    position: relative;

    &:after {
      background: linear-gradient(180deg, rgba(196, 196, 196, 0) 0%, rgba(127, 127, 127, 0.25) 100%);
      bottom: 0;
      content: '';
      left: 0;
      margin: ${theme.spacing(1)} calc(${theme.spacing(4)} - 1px) 0;
      position: absolute;
      right: 0;
      top: 0;
    }
  `,
  imagePlaceholder: css`
    align-items: center;
    color: ${theme.colors.text.secondary};
    display: flex;
    height: ${imageHeight}px;
    justify-content: center;
    margin: ${theme.spacing(1)} ${theme.spacing(4)} 0;
    width: ${imageWidth}px;
  `,
  info: css`
    background-color: ${theme.colors.background.canvas};
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    display: flex;
    flex-direction: column;
    min-height: ${theme.spacing(7)};
    gap: ${theme.spacing(1)};
    padding: ${theme.spacing(1)} ${theme.spacing(2)};
  `,
  infoHeader: css`
    display: flex;
    gap: ${theme.spacing(1)};
    justify-content: space-between;
  `,
  tagList: css`
    justify-content: flex-start;
  `,
  titleContainer: css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(0.5)};
  `,
  updateContainer: css`
    align-items: flex-end;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    font-size: ${theme.typography.bodySmall.fontSize};
    gap: ${theme.spacing(0.5)};
  `,
  update: css`
    color: ${theme.colors.text.secondary};
    text-align: right;
  `,
});
