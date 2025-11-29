"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { EmergencyTaskABI, GuardianTokenABI } from "@/app/lib/contracts";

const CONTRACT_ADDRESSES = {
  guardianToken: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9" as `0x${string}`,
  emergencyTask: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707" as `0x${string}`,
};

// 任务大厅组件
function TaskMarketplace({
  onAcceptTask,
}: {
  onAcceptTask: (taskId: number) => void;
}) {
  const { data: taskCount } = useReadContract({
    address: CONTRACT_ADDRESSES.emergencyTask,
    abi: EmergencyTaskABI,
    functionName: "nextTaskId",
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">📋 任务大厅</h3>
      {taskCount && Number(taskCount) > 0 ? (
        <div className="space-y-3">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">紧急求助任务 #0</div>
                <div className="text-sm text-gray-600">赏金: 100 GLT</div>
              </div>
              <button
                onClick={() => onAcceptTask(0)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
              >
                接单
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          暂无任务，请先创建任务
        </div>
      )}
    </div>
  );
}

// 验证面板组件
function VerificationPanel({
  onVerify,
}: {
  onVerify: (taskId: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">✅ 待验证任务</h3>
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">任务 #0 - 等待验证</div>
            <div className="text-sm text-gray-600">
              证明已提交，需要社区验证
            </div>
          </div>
          <button
            onClick={() => onVerify(0)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
          >
            验证通过
          </button>
        </div>
      </div>
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: any[];
}) {
  return (
    <div className="flex justify-between items-center mb-8 relative">
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center z-10">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold ${
              index <= currentStep
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-500"
            }`}
          >
            {index + 1}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-700 text-center max-w-24">
            {step.title.split(". ")[1]}
          </div>
        </div>
      ))}
      <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-300 -z-10">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function GuardianLinkDemo() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<
    "creator" | "responder" | "verifier"
  >("creator");

  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeCreateTask, data: createTaskHash } =
    useWriteContract();
  const { writeContract: writeAcceptTask, data: acceptTaskHash } =
    useWriteContract();
  const { writeContract: writeSubmitProof, data: submitProofHash } =
    useWriteContract();
  const { writeContract: writeVerifyProof, data: verifyProofHash } =
    useWriteContract();

  // 等待交易确认
  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isLoading: isCreatingTask } = useWaitForTransactionReceipt({
    hash: createTaskHash,
  });
  const { isLoading: isAcceptingTask } = useWaitForTransactionReceipt({
    hash: acceptTaskHash,
  });
  const { isLoading: isSubmittingProof } = useWaitForTransactionReceipt({
    hash: submitProofHash,
  });
  const { isLoading: isVerifying } = useWaitForTransactionReceipt({
    hash: verifyProofHash,
  });

  // 任务创建流程步骤
  const steps = [
    {
      title: "1. 授权代币",
      description: "授权任务合约使用你的 GLT 代币",
      action: () => {
        writeApprove({
          address: CONTRACT_ADDRESSES.guardianToken,
          abi: GuardianTokenABI,
          functionName: "approve",
          args: [CONTRACT_ADDRESSES.emergencyTask, BigInt(100 * 10 ** 18)],
        });
      },
      loading: isApproving,
    },
    {
      title: "2. 创建紧急任务",
      description: "发布一个悬赏 100 GLT 的紧急任务",
      action: () => {
        writeCreateTask({
          address: CONTRACT_ADDRESSES.emergencyTask,
          abi: EmergencyTaskABI,
          functionName: "createTask",
          args: [BigInt(100 * 10 ** 18)],
        });
        setTaskId(0);
      },
      loading: isCreatingTask,
    },
  ];

  // 角色专属功能
  const handleAcceptTask = (taskId: number) => {
    writeAcceptTask({
      address: CONTRACT_ADDRESSES.emergencyTask,
      abi: EmergencyTaskABI,
      functionName: "acceptTask",
      args: [BigInt(taskId)],
    });
  };

  const handleVerifyTask = (taskId: number) => {
    writeVerifyProof({
      address: CONTRACT_ADDRESSES.emergencyTask,
      abi: EmergencyTaskABI,
      functionName: "verifyProof",
      args: [BigInt(taskId)],
    });
  };

  // 监听交易成功
  const { isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  const { isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createTaskHash,
  });
  const { isSuccess: isAcceptSuccess } = useWaitForTransactionReceipt({
    hash: acceptTaskHash,
  });
  const { isSuccess: isSubmitSuccess } = useWaitForTransactionReceipt({
    hash: submitProofHash,
  });
  const { isSuccess: isVerifySuccess } = useWaitForTransactionReceipt({
    hash: verifyProofHash,
  });

  // 自动推进步骤
  useState(() => {
    if (isApproveSuccess && currentStep === 0) {
      setCurrentStep(1);
    }
    if (isCreateSuccess && currentStep === 1) {
      setCurrentStep(2);
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* 角色切换标签 */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("creator")}
          className={`px-4 py-2 font-medium ${
            activeTab === "creator"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500"
          }`}
        >
          👤 任务发布者
        </button>
        <button
          onClick={() => setActiveTab("responder")}
          className={`px-4 py-2 font-medium ${
            activeTab === "responder"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-500"
          }`}
        >
          🏃 响应者
        </button>
        <button
          onClick={() => setActiveTab("verifier")}
          className={`px-4 py-2 font-medium ${
            activeTab === "verifier"
              ? "border-b-2 border-purple-500 text-purple-600"
              : "text-gray-500"
          }`}
        >
          ✅ 验证者
        </button>
      </div>

      {/* 根据角色显示不同界面 */}
      {activeTab === "creator" && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              发布紧急任务
            </h1>
            <p className="text-gray-600">创建任务并设置赏金，等待社区响应</p>
          </div>

          {/* 步骤指示器 */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* 当前步骤内容 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                {steps[currentStep].description}
              </p>

              {currentStep < steps.length ? (
                <button
                  onClick={steps[currentStep].action}
                  disabled={steps[currentStep].loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  {steps[currentStep].loading ? "处理中..." : "执行此步骤"}
                </button>
              ) : (
                <div className="text-green-600">
                  <div className="text-2xl font-bold mb-2">任务创建完成！</div>
                  <div className="text-gray-600">请切换到其他角色继续流程</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "responder" && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              响应紧急任务
            </h1>
            <p className="text-gray-600">接单并提供帮助，获得赏金奖励</p>
          </div>

          <TaskMarketplace onAcceptTask={handleAcceptTask} />

          {/* 响应者操作面板 */}
          {isAcceptSuccess && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">我的任务</h3>
              <p className="text-gray-600 mb-4">
                您已接单，请完成任务后提交证明
              </p>
              <button
                onClick={() =>
                  writeSubmitProof({
                    address: CONTRACT_ADDRESSES.emergencyTask,
                    abi: EmergencyTaskABI,
                    functionName: "submitProof",
                    args: [BigInt(0), "QmXyZ123abcProofHash"],
                  })
                }
                disabled={isSubmittingProof}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
              >
                {isSubmittingProof ? "提交中..." : "提交完成证明"}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "verifier" && (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">社区验证</h1>
            <p className="text-gray-600">监督任务完成情况，确保社区质量</p>
          </div>

          <VerificationPanel onVerify={handleVerifyTask} />
        </div>
      )}

      {/* 任务信息面板 */}
      {taskId !== null && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">任务信息</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">任务ID:</span>{" "}
              {taskId}
            </div>
            <div>
              <span className="text-blue-700 font-medium">赏金:</span> 100 GLT
            </div>
            <div>
              <span className="text-blue-700 font-medium">当前角色:</span>
              {activeTab === "creator" && " 发布者"}
              {activeTab === "responder" && " 响应者"}
              {activeTab === "verifier" && " 验证者"}
            </div>
            <div>
              <span className="text-blue-700 font-medium">状态:</span>
              {currentStep === 0 && " 准备中"}
              {currentStep === 1 && " 创建任务"}
              {currentStep === 2 && " 任务已发布"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
