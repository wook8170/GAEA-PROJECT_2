import { isEqual, set } from "lodash-es";
import { action, makeObservable, observable, runInAction } from "mobx";
import { computedFn } from "mobx-utils";
// components
import type {
  ChartDataType,
  IBlockUpdateDependencyData,
  IGanttBlock,
  TGanttViews,
} from "@plane/types";
import { currentViewDataWithView } from "@/components/gantt-chart/data";
import {
  getDateFromPositionOnGantt,
  getItemPositionWidth,
  getPositionFromDate,
} from "@/components/gantt-chart/views/helpers";
// helpers
import { renderFormattedPayloadDate } from "@plane/utils";
// store
import type { RootStore } from "@/plane-web/store/root.store";

// types
type BlockData = {
  id: string;
  name: string;
  sort_order: number | null;
  start_date?: string | undefined | null;
  target_date?: string | undefined | null;
  project_id?: string | undefined | null;
};

export interface IBaseTimelineStore {
  // observables
  currentView: TGanttViews;
  currentViewData: ChartDataType | undefined;
  activeBlockId: string | null;
  renderView: any;
  isDragging: boolean;
  isDependencyEnabled: boolean;
  //
  setBlockIds: (ids: string[]) => void;
  getBlockById: (blockId: string) => IGanttBlock;
  // computed functions
  getIsCurrentDependencyDragging: (blockId: string) => boolean;
  isBlockActive: (blockId: string) => boolean;
  // actions
  updateCurrentView: (view: TGanttViews) => void;
  updateCurrentViewData: (data: ChartDataType | undefined) => void;
  updateActiveBlockId: (blockId: string | null) => void;
  updateRenderView: (data: any) => void;
  updateAllBlocksOnChartChangeWhileDragging: (addedWidth: number) => void;
  getUpdatedPositionAfterDrag: (
    id: string,
    shouldUpdateHalfBlock: boolean,
    ignoreDependencies?: boolean
  ) => IBlockUpdateDependencyData[];
  updateBlockPosition: (id: string, deltaLeft: number, deltaWidth: number, ignoreDependencies?: boolean) => void;
  getNumberOfDaysFromPosition: (position: number | undefined) => number | undefined;
  setIsDragging: (isDragging: boolean) => void;
  initGantt: () => void;

  getDateFromPositionOnGantt: (position: number, offsetDays: number) => Date | undefined;
  getPositionFromDateOnGantt: (date: string | Date, offSetWidth: number) => number | undefined;
}

export class BaseTimeLineStore implements IBaseTimelineStore {
  blocksMap: Record<string, IGanttBlock> = {};
  blockIds: string[] | undefined = undefined;

  isDragging: boolean = false;
  currentView: TGanttViews = "week";
  currentViewData: ChartDataType | undefined = undefined;
  activeBlockId: string | null = null;
  renderView: any = [];

  rootStore: RootStore;

  isDependencyEnabled = false;

  constructor(_rootStore: RootStore) {
    makeObservable(this, {
      // observables
      blocksMap: observable,
      blockIds: observable,
      isDragging: observable.ref,
      currentView: observable.ref,
      currentViewData: observable,
      activeBlockId: observable.ref,
      renderView: observable,
      // actions
      setIsDragging: action,
      setBlockIds: action.bound,
      initGantt: action.bound,
      updateCurrentView: action.bound,
      updateCurrentViewData: action.bound,
      updateActiveBlockId: action.bound,
      updateRenderView: action.bound,
    });

    this.initGantt();

    this.rootStore = _rootStore;
  }

  setBlockIds = (ids: string[]) => {
    this.blockIds = ids;
  };

  setIsDragging = (isDragging: boolean) => {
    runInAction(() => {
      this.isDragging = isDragging;
    });
  };

  isBlockActive = computedFn((blockId: string): boolean => this.activeBlockId === blockId);

  updateCurrentView = (view: TGanttViews) => {
    this.currentView = view;
  };

  updateCurrentViewData = (data: ChartDataType | undefined) => {
    runInAction(() => {
      this.currentViewData = data;
    });
  };

  updateActiveBlockId = (blockId: string | null) => {
    this.activeBlockId = blockId;
  };

  updateRenderView = (data: any[]) => {
    this.renderView = data;
  };

  initGantt = () => {
    const newCurrentViewData = currentViewDataWithView(this.currentView);

    runInAction(() => {
      this.currentViewData = newCurrentViewData;
      this.blocksMap = {};
      this.blockIds = undefined;
    });
  };

  getBlockById = computedFn((blockId: string) => this.blocksMap[blockId]);

  updateBlocks(getDataById: (id: string) => BlockData | undefined | null) {
    if (!this.blockIds || !Array.isArray(this.blockIds) || this.isDragging) return true;

    const updatedBlockMaps: { path: string[]; value: any }[] = [];
    const newBlocks: IGanttBlock[] = [];

    for (const blockId of this.blockIds) {
      const blockData = getDataById(blockId);
      if (!blockData) continue;

      const block: IGanttBlock = {
        data: blockData,
        id: blockData?.id,
        name: blockData.name,
        sort_order: blockData?.sort_order ?? undefined,
        start_date: blockData?.start_date ?? undefined,
        target_date: blockData?.target_date ?? undefined,
        meta: {
          project_id: blockData?.project_id,
        },
      };
      if (this.currentViewData && (this.currentViewData?.data?.startDate || this.currentViewData?.data?.dayWidth)) {
        block.position = getItemPositionWidth(this.currentViewData, block);
      }

      if (this.blocksMap[blockId]) {
        for (const key of Object.keys(block)) {
          const currValue = this.blocksMap[blockId][key as keyof IGanttBlock];
          const nextValue = block[key as keyof IGanttBlock];
          if (!isEqual(currValue, nextValue)) {
            updatedBlockMaps.push({ path: [blockId, key], value: nextValue });
          }
        }
      } else {
        newBlocks.push(block);
      }
    }

    runInAction(() => {
      for (const updatedBlock of updatedBlockMaps) {
        set(this.blocksMap, updatedBlock.path, updatedBlock.value);
      }

      for (const newBlock of newBlocks) {
        set(this.blocksMap, [newBlock.id], newBlock);
      }
    });
  }

  getNumberOfDaysFromPosition = (position: number | undefined) => {
    if (!this.currentViewData || !position) return;
    return Math.round(position / this.currentViewData.data.dayWidth);
  };

  getPositionFromDateOnGantt = computedFn((date: string | Date, offSetWidth: number) => {
    if (!this.currentViewData) return;
    return getPositionFromDate(this.currentViewData, date, offSetWidth);
  });

  getDateFromPositionOnGantt = computedFn((position: number, offsetDays: number) => {
    if (!this.currentViewData) return;
    return getDateFromPositionOnGantt(position, this.currentViewData, offsetDays);
  });

  updateAllBlocksOnChartChangeWhileDragging = action((addedWidth: number) => {
    if (!this.blockIds || !this.isDragging) return;

    runInAction(() => {
      this.blockIds?.forEach((blockId) => {
        const currBlock = this.blocksMap[blockId];
        if (!currBlock || !currBlock.position) return;
        currBlock.position.marginLeft += addedWidth;
      });
    });
  });

  getUpdatedPositionAfterDrag = action((id: string, shouldUpdateHalfBlock: boolean) => {
    const currBlock = this.blocksMap[id];
    if (!currBlock?.position || !this.currentViewData) return [];
    const updatePayload: IBlockUpdateDependencyData = { id, meta: currBlock.meta };

    if (shouldUpdateHalfBlock || currBlock.start_date) {
      updatePayload.start_date = renderFormattedPayloadDate(
        getDateFromPositionOnGantt(currBlock.position.marginLeft, this.currentViewData)
      );
    }
    if (shouldUpdateHalfBlock || currBlock.target_date) {
      updatePayload.target_date = renderFormattedPayloadDate(
        getDateFromPositionOnGantt(currBlock.position.marginLeft + currBlock.position.width, this.currentViewData, -1)
      );
    }
    return [updatePayload];
  });

  updateBlockPosition = action((id: string, deltaLeft: number, deltaWidth: number) => {
    const currBlock = this.blocksMap[id];
    if (!currBlock?.position) return;
    const newMarginLeft = currBlock.position.marginLeft + deltaLeft;
    const newWidth = currBlock.position.width + deltaWidth;

    runInAction(() => {
      set(this.blocksMap, [id, "position"], {
        marginLeft: newMarginLeft ?? currBlock.position?.marginLeft,
        width: newWidth ?? currBlock.position?.width,
      });
    });
  });

  getIsCurrentDependencyDragging = computedFn((blockId: string) => false);
}

