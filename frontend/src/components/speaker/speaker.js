import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CollapsibleSite() {
    // -------------------------------------
    // localStorage からデータを読み込み
    // -------------------------------------
    const loadSidebarGroups = () => {
        try {
            const stored = localStorage.getItem("sidebarGroups");
            return stored
                ? JSON.parse(stored)
                : [
                    {
                        id: 1,
                        label: "デフォルトグループ",
                        sections: [
                            {
                                id: 1,
                                title: "サンプルの題名",
                                content: "ここに折りたためる文章が入ります。",
                                isCollapsed: false,
                                isEditing: false,
                                backgroundColor: "#ffffff",
                            },
                        ],
                    },
                ];
        } catch (e) {
            return [
                {
                    id: 1,
                    label: "デフォルトグループ",
                    sections: [
                        {
                            id: 1,
                            title: "サンプルの題名",
                            content: "ここに折りたためる文章が入ります。",
                            isCollapsed: false,
                            isEditing: false,
                            backgroundColor: "#ffffff",
                        },
                    ],
                },
            ];
        }
    };

    // localStorage から選択中のグループIDを読み込み
    const loadSelectedGroupId = () => {
        try {
            const stored = localStorage.getItem("selectedGroupId");
            return stored ? parseInt(stored, 10) : 1;
        } catch (e) {
            return 1;
        }
    };

    // ステート定義
    const [sidebarGroups, setSidebarGroups] = useState(loadSidebarGroups);
    const [selectedGroupId, setSelectedGroupId] = useState(loadSelectedGroupId);

    // モーダル制御とインポート用テキスト
    const [showImportModal, setShowImportModal] = useState(false);
    const [importText, setImportText] = useState("");

    // ステート変化時に localStorage に自動保存
    useEffect(() => {
        localStorage.setItem("sidebarGroups", JSON.stringify(sidebarGroups));
    }, [sidebarGroups]);

    useEffect(() => {
        localStorage.setItem("selectedGroupId", String(selectedGroupId));
    }, [selectedGroupId]);

    // サイドバーに新しいグループを追加
    const handleAddSidebarGroup = () => {
        const newId =
            sidebarGroups.length > 0
                ? sidebarGroups[sidebarGroups.length - 1].id + 1
                : 1;
        const newGroup = {
            id: newId,
            label: `新しいグループ${newId}`,
            sections: [],
        };
        setSidebarGroups((prev) => [...prev, newGroup]);
        setSelectedGroupId(newId);
    };

    // サイドバーのグループ名を編集
    const handleChangeSidebarLabel = (groupId, newLabel) => {
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === groupId) {
                    return { ...group, label: newLabel };
                }
                return group;
            })
        );
    };

    // サイドバーのグループを切り替え
    const handleSelectSidebarGroup = (groupId) => {
        setSelectedGroupId(groupId);
    };

    // グループの削除
    const handleDeleteSidebarGroup = (groupId) => {
        setSidebarGroups((prev) => {
            const newGroups = prev.filter((g) => g.id !== groupId);
            // 削除したグループが選択中の場合、選択を変更
            if (groupId === selectedGroupId && newGroups.length > 0) {
                // とりあえず先頭を選択
                setSelectedGroupId(newGroups[0].id);
            } else if (newGroups.length === 0) {
                // すべて削除された場合
                setSelectedGroupId(-1);
            }
            return newGroups;
        });
    };

    // グループの複製
    const handleDuplicateSidebarGroup = (groupId) => {
        setSidebarGroups((prev) => {
            const target = prev.find((g) => g.id === groupId);
            if (!target) return prev;

            // 新しいユニークIDを算出
            const newGroupId = prev.length > 0 ? Math.max(...prev.map((g) => g.id)) + 1 : 1;

            // sections 内の id はそのままでも OK (グループIDが違うので衝突しない)
            const duplicated = {
                ...target,
                id: newGroupId,
                label: target.label + "(複製)",
                // sections: [...target.sections],
                sections: target.sections.map((sec) => ({ ...sec })),
            };

            return [...prev, duplicated];
        });
    };

    // 選択中のグループを取り出す
    const selectedGroup = sidebarGroups.find((g) => g.id === selectedGroupId);
    const sections = selectedGroup ? selectedGroup.sections : [];

    // エクスポート（クリップボードにコピー）
    const handleExport = async () => {
        const data = {
            sidebarGroups,
            selectedGroupId,
        };
        const dataStr = JSON.stringify(data, null, 2);
        try {
            await navigator.clipboard.writeText(dataStr);
            alert("クリップボードにコピーしました");
        } catch (error) {
            alert("コピーに失敗しました");
        }
    };

    // インポート（モーダル表示）
    const openImportModal = () => {
        setShowImportModal(true);
        setImportText("");
    };

    // モーダル内でのインポート実行
    const handleImportFromText = () => {
        try {
            const parsed = JSON.parse(importText);
            if (parsed.sidebarGroups && Array.isArray(parsed.sidebarGroups)) {
                setSidebarGroups(parsed.sidebarGroups);
            }
            if (
                parsed.selectedGroupId &&
                typeof parsed.selectedGroupId === "number"
            ) {
                setSelectedGroupId(parsed.selectedGroupId);
            } else {
                if (parsed.sidebarGroups && parsed.sidebarGroups[0]) {
                    setSelectedGroupId(parsed.sidebarGroups[0].id);
                }
            }
            setShowImportModal(false);
        } catch {
            alert("インポートするJSONが不正です。");
        }
    };

    // 折りたたみの開閉
    const handleToggle = (id) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updatedSections = group.sections.map((section) => {
                        if (section.id === id) {
                            return { ...section, isCollapsed: !section.isCollapsed };
                        }
                        return section;
                    });
                    return { ...group, sections: updatedSections };
                }
                return group;
            })
        );
    };

    // 編集モードのON/OFF
    const handleEditToggle = (id) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updatedSections = group.sections.map((section) => {
                        if (section.id === id) {
                            return { ...section, isEditing: !section.isEditing };
                        }
                        return section;
                    });
                    return { ...group, sections: updatedSections };
                }
                return group;
            })
        );
    };

    // 題名の更新
    const handleChangeTitle = (id, newTitle) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updatedSections = group.sections.map((section) => {
                        if (section.id === id) {
                            return { ...section, title: newTitle };
                        }
                        return section;
                    });
                    return { ...group, sections: updatedSections };
                }
                return group;
            })
        );
    };

    // 本文の更新
    const handleChangeContent = (id, newContent) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updatedSections = group.sections.map((section) => {
                        if (section.id === id) {
                            return { ...section, content: newContent };
                        }
                        return section;
                    });
                    return { ...group, sections: updatedSections };
                }
                return group;
            })
        );
    };

    // 背景色の更新
    const handleChangeBackgroundColor = (id, newColor) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updatedSections = group.sections.map((section) => {
                        if (section.id === id) {
                            return { ...section, backgroundColor: newColor };
                        }
                        return section;
                    });
                    return { ...group, sections: updatedSections };
                }
                return group;
            })
        );
    };

    // 新規セクション追加
    const handleAddSection = () => {
        if (!selectedGroup) return;
        const newId =
            selectedGroup.sections.length > 0
                ? selectedGroup.sections[selectedGroup.sections.length - 1].id + 1
                : 1;

        const newSection = {
            id: newId,
            title: "新しい題名",
            content: "新しい文章",
            isCollapsed: false,
            isEditing: false,
            backgroundColor: "#ffffff",
        };

        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    return { ...group, sections: [...group.sections, newSection] };
                }
                return group;
            })
        );
    };

    // セクション削除
    const handleDeleteSection = (id) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const updated = group.sections.filter((section) => section.id !== id);
                    return { ...group, sections: updated };
                }
                return group;
            })
        );
    };

    // セクション複製
    const handleDuplicateSection = (id) => {
        if (!selectedGroup) return;
        setSidebarGroups((prev) => {
            return prev.map((group) => {
                if (group.id === selectedGroupId) {
                    // 対象セクションを探す
                    const target = group.sections.find((s) => s.id === id);
                    if (!target) return group;
                    // 新しい一意IDを決める
                    const newId = group.sections.length
                        ? Math.max(...group.sections.map((sec) => sec.id)) + 1
                        : 1;
                    const duplicated = {
                        ...target,
                        id: newId,
                        title: target.title + "(複製)",
                    };
                    return { ...group, sections: [...group.sections, duplicated] };
                } else {
                    return group;
                }
            });
        });
    };

    // セクション移動（上下）
    const handleMoveSection = (id, direction) => {
        if (!selectedGroup) return;

        setSidebarGroups((prev) =>
            prev.map((group) => {
                if (group.id === selectedGroupId) {
                    const idx = group.sections.findIndex((sec) => sec.id === id);
                    if (idx === -1) return group;
                    const newSections = [...group.sections];

                    // 上へ
                    if (direction === "up" && idx > 0) {
                        const tmp = newSections[idx];
                        newSections[idx] = newSections[idx - 1];
                        newSections[idx - 1] = tmp;
                    } else if (direction === "down" && idx < newSections.length - 1) {
                        const tmp = newSections[idx];
                        newSections[idx] = newSections[idx + 1];
                        newSections[idx + 1] = tmp;
                    }
                    return { ...group, sections: newSections };
                }
                return group;
            })
        );
    };

    // --- インラインCSSでTailwindを使わないシンプルなスタイルを当てる

    const rootStyle = {
        position: "relative",
        display: "flex",
        height: "100vh",
    };

    const sidebarStyle = {
        width: "16rem",
        backgroundColor: "#f3f4f6",
        padding: "16px",
        borderRight: "1px solid #ccc",
        height: "300vh", // サイドバーを画面3枚分の高さに設定
    };

    const sidebarTitleStyle = {
        fontWeight: "bold",
        fontSize: "1.125rem",
        marginBottom: "0.5rem",
    };

    const sidebarButtonStyle = {
        display: "block",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        marginTop: "8px",
        cursor: "pointer",
        backgroundColor: "#fff",
    };

    const mainStyle = {
        flex: 1,
        padding: "16px",
        overflow: "auto",
    };

    const groupItemStyle = {
        cursor: "pointer",
        padding: "8px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        marginBottom: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const activeGroupStyle = {
        backgroundColor: "#e5e7eb",
    };

    const addSectionBtnStyle = {
        display: "inline-block",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        cursor: "pointer",
        backgroundColor: "#fff",
        marginBottom: "16px",
    };

    const sectionStyle = {
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        marginBottom: "16px",
        transition: "opacity 0.3s",
    };

    const sectionHeaderStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
    };

    const sectionTitleStyle = {
        fontSize: "1.25rem",
        fontWeight: "bold",
        margin: 0,
        display: "inline-block",
    };

    const editButtonStyle = {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "4px 8px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        cursor: "pointer",
        backgroundColor: "#fff",
        marginLeft: "8px",
    };

    const collapsibleStyle = {
        overflow: "hidden",
        transition: "height 0.3s ease, opacity 0.3s ease",
    };

    const modalOverlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
    };

    const modalContentStyle = {
        backgroundColor: "#fff",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        maxWidth: "600px",
        width: "100%",
    };

    const modalTitleStyle = {
        fontSize: "1.125rem",
        fontWeight: "bold",
        marginBottom: "8px",
    };

    const modalButtonBarStyle = {
        textAlign: "right",
    };

    const modalButtonStyle = {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "8px 12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        cursor: "pointer",
        backgroundColor: "#fff",
        marginLeft: "8px",
    };

    // アイコン用スタイル（小さいボタン）
    const iconButtonStyle = {
        border: "1px solid #ccc",
        borderRadius: "50%",
        width: "24px",
        height: "24px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "4px",
        cursor: "pointer",
        backgroundColor: "#fff",
        fontSize: "0.8rem",
    };

    return (
        <div style={rootStyle}>
            {/* 左側サイドバー */}
            <div style={sidebarStyle}>
                <h2 style={sidebarTitleStyle}>サイドバー</h2>
                <button style={sidebarButtonStyle} onClick={handleAddSidebarGroup}>
                    グループを追加
                </button>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                    <button
                        style={{ ...sidebarButtonStyle, width: "50%", marginTop: 0 }}
                        onClick={handleExport}
                    >
                        エクスポート
                    </button>
                    <button
                        style={{ ...sidebarButtonStyle, width: "50%", marginTop: 0 }}
                        onClick={openImportModal}
                    >
                        インポート
                    </button>
                </div>

                <div style={{ marginTop: "16px" }}>
                    {sidebarGroups.map((group) => {
                        const isActive = group.id === selectedGroupId;
                        return (
                            <div
                                key={group.id}
                                style={{
                                    ...groupItemStyle,
                                    ...(isActive ? activeGroupStyle : {}),
                                }}
                                onClick={() => handleSelectSidebarGroup(group.id)}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    {isActive ? (
                                        <input
                                            style={{ border: "1px solid #ccc", borderRadius: "4px", width: "8rem" }}
                                            value={group.label}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleChangeSidebarLabel(group.id, e.target.value);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: "600" }}>{group.label}</span>
                                    )}
                                    {/* 複製 & 削除アイコン */}
                                    <span
                                        style={iconButtonStyle}
                                        title="グループを複製"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateSidebarGroup(group.id);
                                        }}
                                    >
                    📄
                  </span>
                                    <span
                                        style={iconButtonStyle}
                                        title="グループを削除"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSidebarGroup(group.id);
                                        }}
                                    >
                    🗑
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* メインコンテンツ部分 */}
            <div style={mainStyle}>
                {selectedGroup && (
                    <button style={addSectionBtnStyle} onClick={handleAddSection}>
                        セクションを追加
                    </button>
                )}

                {sections.map((section, idx) => {
                    const {
                        id,
                        title,
                        content,
                        isCollapsed,
                        isEditing,
                        backgroundColor,
                    } = section;

                    return (
                        <motion.div
                            key={id}
                            style={{ ...sectionStyle, backgroundColor }}
                            onClick={() => {
                                if (!isEditing) handleToggle(id);
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={sectionHeaderStyle}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    {isEditing ? (
                                        <input
                                            style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "4px" }}
                                            value={title}
                                            onChange={(e) => handleChangeTitle(id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <h2 style={sectionTitleStyle}>{title}</h2>
                                    )}
                                    {/* 上下移動, 複製, 削除アイコン */}
                                    <span
                                        style={iconButtonStyle}
                                        title="上へ移動"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveSection(id, "up");
                                        }}
                                    >
                    ⬆
                  </span>
                                    <span
                                        style={iconButtonStyle}
                                        title="下へ移動"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMoveSection(id, "down");
                                        }}
                                    >
                    ⬇
                  </span>
                                    <span
                                        style={iconButtonStyle}
                                        title="複製"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateSection(id);
                                        }}
                                    >
                    📄
                  </span>
                                    <span
                                        style={iconButtonStyle}
                                        title="削除"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteSection(id);
                                        }}
                                    >
                    🗑
                  </span>
                                </div>

                                <button
                                    style={editButtonStyle}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditToggle(id);
                                    }}
                                >
                                    {isEditing ? "編集完了" : "編集"}
                                </button>
                            </div>

                            <motion.div
                                style={collapsibleStyle}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                    height: isCollapsed ? 0 : "auto",
                                    opacity: isCollapsed ? 0 : 1,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <div style={{ marginTop: "8px" }} onClick={(e) => e.stopPropagation()}>
                                    {isEditing ? (
                                        <>
                      <textarea
                          style={{ width: "100%", height: "96px", border: "1px solid #ccc", borderRadius: "4px", padding: "8px" }}
                          value={content}
                          onChange={(e) => handleChangeContent(id, e.target.value)}
                      />
                                            <div style={{ marginTop: "8px" }}>
                                                <label style={{ marginRight: "8px" }}>背景色:</label>
                                                <input
                                                    type="color"
                                                    value={backgroundColor}
                                                    onChange={(e) =>
                                                        handleChangeBackgroundColor(id, e.target.value)
                                                    }
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <p>{content}</p>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {showImportModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2 style={modalTitleStyle}>インポート</h2>
                        <textarea
                            style={{ width: "100%", height: "12rem", border: "1px solid #ccc", padding: "8px", borderRadius: "4px" }}
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                        />
                        <div style={modalButtonBarStyle}>
                            <button style={modalButtonStyle} onClick={handleImportFromText}>
                                インポート実行
                            </button>
                            <button style={modalButtonStyle} onClick={() => setShowImportModal(false)}>
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/*
Test Cases:
1. Render component -> Expect one default group ("デフォルトグループ") with one default section.
2. Click on the section (while not editing) -> Expect the content to collapse.
3. Click on '編集' button -> Expect title and content become editable.
4. Change the background color in editing mode -> Expect the section's background color to update.
5. Click on 'セクションを追加' in main area -> Expect a new section to appear within the currently selected group.
6. Add a new group in the sidebar -> Expect a new group to appear, and auto-select that group.
7. Rename a sidebar group by clicking it, then typing a new label -> Expect label change to appear in the sidebar.
8. Switch between sidebar groups -> Expect different sets of collapsible sections to display accordingly.
9. Reload the page -> Expect to see the last updated sidebarGroups and selectedGroupId from localStorage.
10. Click "エクスポート" -> Expect the JSON string of the entire site state to be copied to clipboard.
11. Click "インポート" -> Expect a modal to appear with a textarea. Paste valid JSON and click "インポート実行" -> Expect site state to be updated.
12. If invalid JSON is pasted -> Expect an alert indicating the JSON is invalid.
13. Click on sidebar group '🗑' -> Expect group to be removed. If it was selected, selection moves to the next group or -1 if none.
14. Click on sidebar group '📄' -> Expect the group to be duplicated with a new ID and label appended with "(複製)".
15. For any section, click '🗑' -> Expect that section to be removed from the group.
16. For any section, click '📄' -> Expect that section to be duplicated within the group with a new ID.
17. For any section, click '⬆' or '⬇' -> Expect the section to move up or down in the list, if possible.
*/
