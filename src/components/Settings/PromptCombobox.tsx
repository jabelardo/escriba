"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Box, Text, TextField, Button, Card, Flex } from "@radix-ui/themes";
import {
  X as LuX,
  ChevronDown as LuChevronDown,
  Check as LuCheck,
} from "lucide-react";
import type { Prompt } from "@/types/settings";

type PromptComboboxProps = {
  label: string;
  items: Prompt[];
  selectedPrompt: Prompt | undefined | null;
  onChange: (prompt: Prompt) => void;
};

export const PromptCombobox = ({
  label,
  items,
  selectedPrompt,
  onChange,
}: PromptComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(selectedPrompt?.id || "");
  const [filteredItems, setFilteredItems] = useState(items);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items based on input value
  const updateFilteredItems = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setFilteredItems(items);
      } else {
        setFilteredItems(
          items.filter((item) =>
            item.id.toLowerCase().includes(value.toLowerCase()),
          ),
        );
      }
    },
    [items],
  );

  // Handle input change
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      updateFilteredItems(value);
      if (!isOpen) {
        setIsOpen(true);
      }
    },
    [updateFilteredItems, isOpen],
  );

  // Handle item selection
  const handleSelectItem = useCallback(
    (prompt: Prompt) => {
      setInputValue(prompt.id);
      setIsOpen(false);
      onChange(prompt);
    },
    [onChange],
  );

  // Handle custom value creation
  const handleInputSubmit = useCallback(() => {
    if (inputValue.trim()) {
      const existingPrompt = items.find((item) => item.id === inputValue);
      if (existingPrompt) {
        onChange(existingPrompt);
      } else {
        onChange({ id: inputValue.trim(), value: "" });
      }
      setIsOpen(false);
    }
  }, [inputValue, items, onChange]);

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setInputValue("");
      setFilteredItems(items);
      onChange({ id: "", value: "" });
      inputRef.current?.focus();
    },
    [items, onChange],
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Only submit if the value has actually changed and is not empty
        if (inputValue.trim() && inputValue !== (selectedPrompt?.id || "")) {
          handleInputSubmit();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, selectedPrompt, handleInputSubmit]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (inputValue.trim()) {
          handleInputSubmit();
        }
      } else if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [handleInputSubmit, inputValue],
  );

  // Update input value when selectedPrompt changes
  useEffect(() => {
    setInputValue(selectedPrompt?.id || "");
  }, [selectedPrompt]);

  // Update filtered items when items change
  useEffect(() => {
    updateFilteredItems(inputValue);
  }, [items, inputValue, updateFilteredItems]);

  const showNewPromptOption =
    inputValue.trim() && !items.find((item) => item.id === inputValue);

  return (
    <Box mb="4" ref={containerRef} style={{ position: "relative" }}>
      <Text
        as="label"
        size="2"
        weight="medium"
        mb="2"
        style={{ display: "block" }}
      >
        {label}
      </Text>

      <Box style={{ position: "relative" }}>
        <TextField.Root
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            updateFilteredItems(inputValue);
          }}
          placeholder="Select existing or type a new prompt name..."
          size="2"
          style={{ width: "100%" }}
        >
          <TextField.Slot side="right">
            <Flex gap="1">
              {inputValue && (
                <Button
                  variant="ghost"
                  size="1"
                  onClick={handleClear}
                  style={{ padding: "10px", minWidth: "auto" }}
                  color="red"
                >
                  <LuX size={20} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(!isOpen);
                  if (!isOpen) {
                    inputRef.current?.focus();
                  }
                }}
                style={{ padding: "10px", minWidth: "auto" }}
              >
                <LuChevronDown
                  size={20}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </Button>
            </Flex>
          </TextField.Slot>
        </TextField.Root>

        {isOpen && (
          <Card
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: "4px",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid var(--gray-6)",
              boxShadow:
                "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            }}
          >
            {showNewPromptOption && (
              <Box
                p="2"
                style={{
                  cursor: "pointer",
                  borderRadius: "var(--radius-2)",
                  backgroundColor: "var(--gray-2)",
                }}
                className="hover:bg-[var(--gray-4)]"
                onClick={() =>
                  handleSelectItem({ id: inputValue.trim(), value: "" })
                }
              >
                <Text size="2" color="gray">
                  New prompt: "{inputValue}"
                </Text>
              </Box>
            )}

            {filteredItems.length === 0 && !showNewPromptOption && (
              <Box p="2">
                <Text size="2" color="gray">
                  No prompts found
                </Text>
              </Box>
            )}

            {filteredItems.map((item) => (
              <Box
                key={item.id}
                p="2"
                style={{
                  cursor: "pointer",
                  borderRadius: "var(--radius-2)",
                  backgroundColor:
                    selectedPrompt?.id === item.id
                      ? "var(--accent-3)"
                      : "transparent",
                }}
                className="hover:bg-[var(--gray-3)]"
                onClick={() => handleSelectItem(item)}
              >
                <Flex justify="between" align="center">
                  <Text size="2">{item.id}</Text>
                  {selectedPrompt?.id === item.id && (
                    <LuCheck size={20} color="var(--accent-11)" />
                  )}
                </Flex>
              </Box>
            ))}
          </Card>
        )}
      </Box>
    </Box>
  );
};
