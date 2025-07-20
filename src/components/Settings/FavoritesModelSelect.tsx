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
  Badge,
  Spinner,
  CheckboxGroup,
  TextField,
  IconButton,
  Callout,
} from "@radix-ui/themes";
import {
  CircleAlert as LuCircleAlert,
  ChevronDown as LuChevronDown,
  X as LuX,
  Search as LuSearch,
} from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { fetchOpenRouterModels } from "@/lib/openrouter/models";
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
    (newFavorites: string[]) => {
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
                    size="2"
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
                      asChild
                      variant="ghost"
                      size="2"
                      onClick={(e) => handleRemoveModel(model.id, e)}
                      style={{
                        padding: "4px",
                        // minWidth: "auto",
                        // height: "auto",
                      }}
                    >
                      <LuX size={16} />
                    </Button>
                  </Badge>
                ))}
                {selectedModels.length > 3 && (
                  <Badge size="2" color="gray">
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
            padding: "8px",
            position: "absolute",
            zIndex: 50,
            marginTop: "4px",
            left: 0,
            right: 0,
          }}
        >
          {/* Search input */}
          <TextField.Root
            placeholder="Search models..."
            size="2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <LuSearch height="16" width="16" />
            </TextField.Slot>
            <TextField.Slot>
              <IconButton
                size="1"
                variant="ghost"
                onClick={() => {
                  if (searchTerm.length) setSearchTerm("");
                  else setIsOpen(false);
                }}
              >
                <LuX height="14" width="14" />
              </IconButton>
            </TextField.Slot>
          </TextField.Root>

          {/* Model list */}
          <Box style={{ maxHeight: "250px", overflowY: "auto" }}>
            {filteredModels.length === 0 ? (
              <Callout.Root color={searchTerm ? "blue" : "red"}>
                <Callout.Icon>
                  <LuCircleAlert size={20} />
                </Callout.Icon>
                <Callout.Text>
                  {searchTerm
                    ? "No models match your search"
                    : "No models available"}
                </Callout.Text>
              </Callout.Root>
            ) : (
              <CheckboxGroup.Root
                defaultValue={favoriteModels}
                onValueChange={(e) => {
                  handleModelToggle(e);
                }}
              >
                {filteredModels.map((model) => (
                  <CheckboxGroup.Item value={model.id}>
                    {model.name}
                  </CheckboxGroup.Item>
                ))}
              </CheckboxGroup.Root>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
};
