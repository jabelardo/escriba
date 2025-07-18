"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Box,
  Text,
  Button,
  Card,
  Flex,
  Checkbox,
  Badge,
  Spinner,
} from "@radix-ui/themes";
import { ChevronDown as LuChevronDown, X as LuX } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { fetchOpenRouterModels } from "@/lib/openrouter/models";
import type { OpenRouterModel } from "@/types/openrouter";
import { useAsync } from "react-use";

export const FavoritesModelSelect = () => {
  const favoriteModels = useSettingsStore((s) => s.favoriteModels);
  const setFavoriteModels = useSettingsStore((s) => s.setFavoriteModels);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const state = useAsync(
    () => fetchOpenRouterModels(import.meta.env.VITE_OPENROUTER_KEY),
    [],
  );

  // Filter models based on search term
  const filteredModels = useMemo(() => {
    if (!state.value) return [];
    const models = !searchTerm.trim()
      ? state.value
      : state.value.filter(
          (model) =>
            model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.id.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    const sorted = [...models].sort((a, b) => {
      const nameA = `${a.name}`.toLowerCase();
      const nameB = `${b.name}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
    return sorted;
  }, [state.value, searchTerm]);

  // Get selected models for display
  const selectedModels = useMemo(() => {
    if (!state.value) return [];
    return state.value.filter((model) => favoriteModels.includes(model.id));
  }, [state.value, favoriteModels]);

  // Handle model selection toggle
  const handleModelToggle = useCallback(
    (modelId: string) => {
      const newFavorites = favoriteModels.includes(modelId)
        ? favoriteModels.filter((id) => id !== modelId)
        : [...favoriteModels, modelId];

      setFavoriteModels(newFavorites);
    },
    [favoriteModels, setFavoriteModels],
  );

  // Handle removing a selected model
  const handleRemoveModel = useCallback(
    (modelId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      setFavoriteModels(favoriteModels.filter((id) => id !== modelId));
    },
    [favoriteModels, setFavoriteModels],
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
      }
    },
    [isOpen],
  );

  const isLoading = state.loading;
  const hasModels = state.value && state.value.length > 0;

  return (
    <Box ref={containerRef} style={{ position: "relative" }}>
      <Text
        as="label"
        size="2"
        weight="medium"
        mb="2"
        style={{ display: "block" }}
      >
        Favorite Models
      </Text>

      <Button
        variant="outline"
        size="2"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          justifyContent: "space-between",
          height: "auto",
          minHeight: "32px",
          padding: "8px 12px",
        }}
        disabled={isLoading}
      >
        <Flex direction="column" align="start" gap="1" style={{ flex: 1 }}>
          {isLoading ? (
            <Flex align="center" gap="2">
              <Spinner size="1" />
              <Text size="2" color="gray">
                Loading models...
              </Text>
            </Flex>
          ) : selectedModels.length > 0 ? (
            <>
              <Text size="2" weight="medium">
                {selectedModels.length} selected
              </Text>
              <Flex wrap="wrap" gap="1" style={{ maxWidth: "100%" }}>
                {selectedModels.slice(0, 3).map((model) => (
                  <Badge
                    key={model.id}
                    size="1"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      maxWidth: "120px",
                    }}
                  >
                    <Text
                      size="1"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {model.name}
                    </Text>
                    <Button
                      variant="ghost"
                      size="1"
                      onClick={(e) => handleRemoveModel(model.id, e)}
                      style={{
                        padding: "2px",
                        minWidth: "auto",
                        height: "auto",
                      }}
                    >
                      <LuX size={10} />
                    </Button>
                  </Badge>
                ))}
                {selectedModels.length > 3 && (
                  <Badge size="1" color="gray">
                    +{selectedModels.length - 3} more
                  </Badge>
                )}
              </Flex>
            </>
          ) : (
            <Text size="2" color="gray">
              {hasModels ? "Select models..." : "No models available"}
            </Text>
          )}
        </Flex>

        <LuChevronDown
          size={16}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            marginLeft: "8px",
          }}
        />
      </Button>

      {isOpen && hasModels && (
        <Card
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: "4px",
            maxHeight: "300px",
            border: "1px solid var(--gray-6)",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
          }}
        >
          {/* Search input */}
          <Box p="2" style={{ borderBottom: "1px solid var(--gray-6)" }}>
            <input
              type="text"
              placeholder="Search models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                border: "1px solid var(--gray-6)",
                borderRadius: "var(--radius-2)",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "var(--color-background)",
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </Box>

          {/* Model list */}
          <Box style={{ maxHeight: "250px", overflowY: "auto" }}>
            {filteredModels.length === 0 ? (
              <Box p="3">
                <Text size="2" color="gray">
                  {searchTerm
                    ? "No models match your search"
                    : "No models available"}
                </Text>
              </Box>
            ) : (
              filteredModels.map((model) => (
                <Box
                  key={model.id}
                  p="2"
                  style={{
                    cursor: "pointer",
                    borderRadius: "var(--radius-2)",
                    margin: "2px",
                  }}
                  className="hover:bg-[var(--gray-3)]"
                  onClick={() => handleModelToggle(model.id)}
                >
                  <Flex align="center" gap="2">
                    <Checkbox
                      checked={favoriteModels.includes(model.id)}
                      size="1"
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleModelToggle(model.id)}
                    />
                    <Box style={{ flex: 1 }}>
                      <Text size="2" weight="medium">
                        {model.name}
                      </Text>
                      <Text size="1" color="gray">
                        {model.id}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
};
