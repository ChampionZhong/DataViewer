import { useState, useEffect } from "react";
import {
	ChevronRight,
	FileJson,
	List as ListIcon,
	Hash,
	Type,
	Image as ImageIcon,
	Calendar,
	Link as LinkIcon,
} from "lucide-react";
import "./ColumnView.css";

interface ColumnViewProps {
	data: any;
	onSelect?: (path: string, value: any) => void;
}

interface PathNode {
	key: string;
	value: any;
	path: string;
	type: string;
}

export default function ColumnView({ data, onSelect }: ColumnViewProps) {
	const [columns, setColumns] = useState<PathNode[][]>([[]]);
	const [selectedPath, setSelectedPath] = useState<string[]>([]);

	useEffect(() => {
		// 初始化第一列
		const rootNodes = buildNodes(data, "");
		setColumns([rootNodes]);
		setSelectedPath([]);
	}, [data]);

	const buildNodes = (obj: any, parentPath: string): PathNode[] => {
		if (!obj || typeof obj !== "object") return [];

		const nodes: PathNode[] = [];

		if (Array.isArray(obj)) {
			obj.forEach((item, index) => {
				const path = parentPath
					? `${parentPath}[${index}]`
					: `[${index}]`;
				nodes.push({
					key: `[${index}]`,
					value: item,
					path,
					type: getValueType(item),
				});
			});
		} else {
			Object.entries(obj).forEach(([key, value]) => {
				const path = parentPath ? `${parentPath}.${key}` : key;
				nodes.push({
					key,
					value,
					path,
					type: getValueType(value),
				});
			});
		}

		return nodes;
	};

	const getValueType = (value: any): string => {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (Array.isArray(value)) return "array";
		if (typeof value === "object") return "object";
		if (typeof value === "string") {
			// 检测特殊字符串类型
			if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
			if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)$/i.test(value))
				return "image";
			if (/^https?:\/\//.test(value)) return "url";
			if (/^#[0-9A-Fa-f]{6}$/.test(value)) return "color";
			return "string";
		}
		if (typeof value === "number") return "number";
		if (typeof value === "boolean") return "boolean";
		return "unknown";
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "object":
				return <FileJson size={14} />;
			case "array":
				return <ListIcon size={14} />;
			case "string":
				return <Type size={14} />;
			case "number":
				return <Hash size={14} />;
			case "date":
				return <Calendar size={14} />;
			case "url":
				return <LinkIcon size={14} />;
			case "image":
				return <ImageIcon size={14} />;
			default:
				return <Type size={14} />;
		}
	};

	const getValuePreview = (value: any, type: string): string => {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (type === "array") return `Array(${value.length})`;
		if (type === "object") return `Object(${Object.keys(value).length})`;
		if (typeof value === "string") {
			return value.length > 50 ? value.substring(0, 50) + "..." : value;
		}
		return String(value);
	};

	const handleNodeClick = (node: PathNode, columnIndex: number) => {
		const newSelectedPath = [
			...selectedPath.slice(0, columnIndex),
			node.key,
		];
		setSelectedPath(newSelectedPath);

		// 如果是对象或数组，展开到下一列
		if (node.type === "object" || node.type === "array") {
			const childNodes = buildNodes(node.value, node.path);
			const newColumns = [
				...columns.slice(0, columnIndex + 1),
				childNodes,
			];
			setColumns(newColumns);
		} else {
			// 如果是叶子节点，移除后面的列
			setColumns(columns.slice(0, columnIndex + 1));
		}

		// 通知父组件
		if (onSelect) {
			onSelect(node.path, node.value);
		}
	};

	const isNodeSelected = (nodeKey: string, columnIndex: number): boolean => {
		return selectedPath[columnIndex] === nodeKey;
	};

	return (
		<div className="column-view">
			<div className="column-view-container">
				{columns.map((columnNodes, columnIndex) => (
					<div
						key={columnIndex}
						className="column">
						<div className="column-content">
							{columnNodes.length === 0 ? (
								<div className="column-empty">无内容</div>
							) : (
								columnNodes.map((node, nodeIndex) => (
									<button
										key={nodeIndex}
										className={`column-item ${
											isNodeSelected(
												node.key,
												columnIndex
											)
												? "selected"
												: ""
										}`}
										onClick={() =>
											handleNodeClick(node, columnIndex)
										}>
										<div className="column-item-main">
											<div className="column-item-icon">
												{getTypeIcon(node.type)}
											</div>
											<div className="column-item-content">
												<div className="column-item-key">
													{node.key}
												</div>
												<div className="column-item-value">
													{getValuePreview(
														node.value,
														node.type
													)}
												</div>
											</div>
										</div>
										{(node.type === "object" ||
											node.type === "array") && (
											<ChevronRight
												size={16}
												className="column-item-arrow"
											/>
										)}
									</button>
								))
							)}
						</div>
					</div>
				))}
			</div>

			{selectedPath.length > 0 && (
				<div className="column-view-path">
					<span className="path-label">路径:</span>
					{selectedPath.map((key, index) => (
						<span
							key={index}
							className="path-segment">
							<ChevronRight size={12} />
							<span>{key}</span>
						</span>
					))}
				</div>
			)}
		</div>
	);
}
