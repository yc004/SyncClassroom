export {};

declare namespace LumeSyncCourseSDK {
  type StateUpdater<T> = T | ((prev: T) => T);

  interface CourseMeta {
    courseId?: string | null;
    slideIndex: number;
  }

  interface StudentInfo {
    ip?: string;
    name?: string;
    studentId?: string;
  }

  interface SubmitContentOptions {
    content: string | Record<string, unknown>;
    fileName?: string;
    mergeFile?: boolean;
  }

  interface SubmitContentResult {
    success: boolean;
    filePath?: string;
  }

  interface SyncVarOptions<T> {
    onChange?: (newValue: T, oldValue: T) => void;
  }

  interface VoteToolbarState {
    visible: boolean;
    voteId: string;
    question: string;
    anonymous: boolean;
    status: 'idle' | 'running' | 'ended';
    durationSec: number;
    remainingSec: number;
    result: unknown;
    canStart: boolean;
  }

  interface VoteOption {
    id: string;
    label: string;
  }

  interface VoteSlideConfig {
    id: string;
    question: string;
    anonymous?: boolean;
    options: VoteOption[];
    theme?: Record<string, unknown>;
  }

  interface SurveyOption {
    value: string | number;
    label: string;
    description?: string;
    icon?: string;
  }

  type SurveyQuestionType = 'single' | 'multiple' | 'text' | 'rating' | 'ranking';

  interface SurveyQuestion {
    id?: string;
    type: SurveyQuestionType;
    title: string;
    description?: string;
    required?: boolean;
    options?: SurveyOption[];
  }

  interface SurveyTheme {
    primary?: string;
    background?: string;
  }

  interface SurveySlideConfig {
    id?: string;
    title?: string;
    description?: string;
    required?: boolean;
    showProgress?: boolean;
    theme?: SurveyTheme;
    submitButtonText?: string;
    successMessage?: string;
    errorMessage?: string;
    questions: SurveyQuestion[];
  }

  interface WebPageSlideProps {
    url: string;
    title?: string;
    openLabel?: string;
    allow?: string;
    referrerPolicy?: string;
  }

  interface CourseSlide {
    id: string;
    title?: string;
    component: any;
  }

  interface CourseData {
    id?: string;
    title: string;
    icon?: string;
    desc?: string;
    color?: string;
    slides: CourseSlide[];
  }

  interface RegisteredVar<T> {
    get(): T;
    set(value: StateUpdater<T>): void;
  }

  interface CanvasAPI {
    getCanvasPoint(evt: unknown, canvas: HTMLCanvasElement | null): {
      x: number;
      y: number;
      nx: number;
      ny: number;
      width: number;
      height: number;
    } | null;
    getHiDpiContext2d(
      canvas: HTMLCanvasElement | null,
      width: number,
      height: number
    ): CanvasRenderingContext2D | null;
    useCanvasDims(
      padL: number,
      padR: number,
      padT: number,
      padB: number
    ): {
      wrapRef: { current: HTMLElement | null };
      dims: {
        cw: number;
        ch: number;
        padL: number;
        padR: number;
        padT: number;
        padB: number;
      };
    };
  }

  interface UIAPI {
    styles: {
      liquidGlassDark: string;
      liquidGlassLight: string;
    };
    usePresence(
      visible: boolean,
      exitMs?: number
    ): {
      render: boolean;
      closing: boolean;
    };
    relayoutSideToolbars(): void;
    SideToolbar: any;
  }

  interface CourseComponentsAPI {
    WebPageSlide(props: WebPageSlideProps): any;
  }

  interface CourseGlobalContextAPI {
    isHost: boolean;
    canvas?: CanvasAPI;
    getSocket(): any;
    getCurrentCourseMeta(): CourseMeta;
    setVoteToolbarState(patch?: Partial<VoteToolbarState>): void;
    clearVoteToolbarState(): void;
    useSyncVar<T>(
      key: string,
      initialValue: T | (() => T),
      options?: SyncVarOptions<T>
    ): [T, (value: StateUpdater<T>) => void];
    useLocalVar<T>(
      key: string,
      initialValue: T | (() => T),
      options?: SyncVarOptions<T>
    ): [T, (value: StateUpdater<T>) => void];
    registerSyncVar<T>(
      key: string,
      initialValue: T | (() => T),
      options?: SyncVarOptions<T>
    ): RegisteredVar<T>;
    registerVar<T>(
      key: string,
      initialValue: T | (() => T),
      options?: SyncVarOptions<T>
    ): RegisteredVar<T>;
    getStudentInfo(): StudentInfo;
    submitContent(options: SubmitContentOptions): Promise<SubmitContentResult>;
  }
}

declare global {
  interface Window {
    CourseData: LumeSyncCourseSDK.CourseData;
    CourseGlobalContext: LumeSyncCourseSDK.CourseGlobalContextAPI;
    __LumeSyncCanvas: LumeSyncCourseSDK.CanvasAPI;
    __LumeSyncUI: LumeSyncCourseSDK.UIAPI;
    CourseComponents: LumeSyncCourseSDK.CourseComponentsAPI;
    VoteSlide: (props: { config: LumeSyncCourseSDK.VoteSlideConfig }) => any;
    SurveySlide: (props: { config: LumeSyncCourseSDK.SurveySlideConfig }) => any;
  }

  const VoteSlide: (props: { config: LumeSyncCourseSDK.VoteSlideConfig }) => any;
  const SurveySlide: (props: { config: LumeSyncCourseSDK.SurveySlideConfig }) => any;
}
