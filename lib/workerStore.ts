import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "WORKER";

export interface Worker {
  id: string;
  name: string;
  initials: string;
  phone: string;
  godown: string;
  role: "WORKER" | "SUPERVISOR";
  isActive: boolean;
}

export interface WorkerTaskItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  qtyRequired: number;
  godown: string;
  location: string;
  qtyAvailable: number;
  isLowStock: boolean;
  isPicked?: boolean;
}

export interface WorkerTask {
  id: string;
  orderId: string;
  orderNo: string;
  customerName: string;
  priority: "NORMAL" | "HIGH" | "URGENT";
  workerId: string;
  workerName: string;
  items: WorkerTaskItem[];
  notes?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  allocatedAt: string;
  completedAt?: string;
  completedBy?: string;
  dueDate: string;
}

export const WORKERS: Worker[] = [
  { id: "W001", name: "Raju More", initials: "RM", phone: "+91 98765 55001", godown: "Main Warehouse", role: "WORKER", isActive: true },
  { id: "W002", name: "Suresh Kamble", initials: "SK", phone: "+91 98765 55002", godown: "Main Warehouse", role: "WORKER", isActive: true },
  { id: "W003", name: "Dinesh Jadhav", initials: "DJ", phone: "+91 98765 55003", godown: "Secondary Store", role: "SUPERVISOR", isActive: true },
  { id: "W004", name: "Kiran Pawar", initials: "KP", phone: "+91 98765 55004", godown: "Secondary Store", role: "WORKER", isActive: true },
  { id: "W005", name: "Anil Shirke", initials: "AS2", phone: "+91 98765 55005", godown: "Main Warehouse", role: "WORKER", isActive: false },
];

interface WorkerStore {
  currentRole: UserRole;
  currentWorkerId: string | null;
  workerTasks: WorkerTask[];
  switchToWorker: (workerId: string) => void;
  switchToAdmin: () => void;
  allocateTask: (task: Omit<WorkerTask, "id" | "allocatedAt" | "status">) => string;
  updateTaskStatus: (taskId: string, status: WorkerTask["status"], completedBy?: string) => void;
  updateItemPicked: (taskId: string, itemId: string, picked: boolean) => void;
  getTasksForWorker: (workerId: string) => WorkerTask[];
  getTodaysTasks: (workerId: string) => WorkerTask[];
}

const TODAY = new Date().toISOString().split("T")[0];

// Seed tasks for demo
const SEED_TASKS: WorkerTask[] = [
  {
    id: "TASK-001",
    orderId: "O001",
    orderNo: "#1048",
    customerName: "ABC Industries Pvt. Ltd.",
    priority: "HIGH",
    workerId: "W001",
    workerName: "Raju More",
    items: [
      {
        itemId: "I001",
        itemName: "AJAX 1000×20 GREEN ANCHOR BOLT",
        itemCode: "AJX-1000-20-GRN",
        qtyRequired: 100,
        godown: "Main Warehouse",
        location: "A12",
        qtyAvailable: 85,
        isLowStock: false,
        isPicked: false,
      },
    ],
    notes: "Urgent delivery for site #4 — handle with care",
    status: "IN_PROGRESS",
    allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    dueDate: TODAY,
  },
  {
    id: "TASK-002",
    orderId: "O004",
    orderNo: "#1045",
    customerName: "Bharat Steel Works",
    priority: "NORMAL",
    workerId: "W001",
    workerName: "Raju More",
    items: [
      {
        itemId: "I004",
        itemName: "POWERFIT 300×10 SS WASHER",
        itemCode: "PWF-300-10-SS",
        qtyRequired: 500,
        godown: "Main Warehouse",
        location: "D05",
        qtyAvailable: 500,
        isLowStock: false,
        isPicked: false,
      },
    ],
    status: "PENDING",
    allocatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    dueDate: TODAY,
  },
  {
    id: "TASK-003",
    orderId: "O005",
    orderNo: "#1044",
    customerName: "Excellent Builders",
    priority: "NORMAL",
    workerId: "W003",
    workerName: "Dinesh Jadhav",
    items: [
      {
        itemId: "I005",
        itemName: "ULTRA 200×8 SELF DRILL SCREW",
        itemCode: "ULT-200-08-SDS",
        qtyRequired: 150,
        godown: "Secondary Store",
        location: "R02",
        qtyAvailable: 12,
        isLowStock: true,
        isPicked: false,
      },
    ],
    status: "COMPLETED",
    allocatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    completedBy: "Dinesh Jadhav",
    dueDate: TODAY,
  },
];

export const useWorkerStore = create<WorkerStore>()(
  persist(
    (set, get) => ({
      currentRole: "ADMIN",
      currentWorkerId: null,
      workerTasks: SEED_TASKS,

      switchToWorker: (workerId) =>
        set({ currentRole: "WORKER", currentWorkerId: workerId }),

      switchToAdmin: () =>
        set({ currentRole: "ADMIN", currentWorkerId: null }),

      allocateTask: (task) => {
        const id = "TASK-" + Date.now();
        const newTask: WorkerTask = {
          ...task,
          id,
          status: "PENDING",
          allocatedAt: new Date().toISOString(),
        };
        set((state) => ({ workerTasks: [...state.workerTasks, newTask] }));
        return id;
      },

      updateTaskStatus: (taskId, status, completedBy) =>
        set((state) => ({
          workerTasks: state.workerTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status,
                  ...(status === "COMPLETED"
                    ? { completedAt: new Date().toISOString(), completedBy }
                    : {}),
                }
              : t
          ),
        })),

      updateItemPicked: (taskId, itemId, picked) =>
        set((state) => ({
          workerTasks: state.workerTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  items: t.items.map((i) =>
                    i.itemId === itemId ? { ...i, isPicked: picked } : i
                  ),
                }
              : t
          ),
        })),

      getTasksForWorker: (workerId) =>
        get().workerTasks.filter((t) => t.workerId === workerId),

      getTodaysTasks: (workerId) =>
        get().workerTasks.filter(
          (t) => t.workerId === workerId && t.dueDate === TODAY
        ),
    }),
    { name: "vilasales-workers" }
  )
);
