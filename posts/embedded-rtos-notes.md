---
title: 嵌入式入门：从裸机到 RTOS 的思维转变
desc: 当你从 while(1) 大循环转向 FreeRTOS 任务调度，需要重新理解并发、优先级与资源共享。
category: embedded
tags: RTOS, STM32
date: 2026-09-10
---

## 裸机的世界：while(1) 大循环

```c
int main(void) {
    system_init();
    while (1) {
        read_sensor();
        update_display();
        check_button();
        delay_ms(10);   // 阻塞！
    }
}
```

问题很明显：`delay` 浪费 CPU，任何一步卡住，整个系统都停摆。

## RTOS 的世界：一切皆任务

切换到 FreeRTOS 后，程序变成一组**并发任务**：

```c
void sensor_task(void *arg) {
    for (;;) {
        read_sensor();
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}

void display_task(void *arg) {
    for (;;) {
        update_display();
        vTaskDelay(pdMS_TO_TICKS(50));
    }
}
```

调度器根据**优先级**决定谁运行，`vTaskDelay` 期间 CPU 让给其他任务。

## 必须重新理解的三件事

### 1. 优先级

- 高优先级任务一旦就绪，立即抢占低优先级任务
- 中断的优先级永远高于任何任务

### 2. 共享资源与互斥

多个任务读写同一资源需要加锁：

```c
xSemaphoreTake(i2c_mutex, portMAX_DELAY);
i2c_read(...);
xSemaphoreGive(i2c_mutex);
```

### 3. 栈溢出

每个任务有独立栈空间，回调里开大数组是翻车重灾区。开启栈溢出检测：

```c
uxTaskGetStackHighWaterMark(NULL);
```

## 什么时候不需要 RTOS

- 任务单一、时序简单 → 状态机 + 定时器中断足够
- 极度内存受限（< 4KB RAM）→ 裸机更合适

**RTOS 不是高级，是另一种权衡。**
