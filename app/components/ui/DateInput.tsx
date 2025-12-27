"use client";

import {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight, Calendar, ChevronDown} from "lucide-react";
import {DropDownContent} from "./DropDown";

interface DateInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

const MONTHS = [
	"Tháng 1",
	"Tháng 2",
	"Tháng 3",
	"Tháng 4",
	"Tháng 5",
	"Tháng 6",
	"Tháng 7",
	"Tháng 8",
	"Tháng 9",
	"Tháng 10",
	"Tháng 11",
	"Tháng 12",
];

const DAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

interface SelectDropdownProps {
	value: number;
	onChange: (value: number) => void;
	options: {label: string; value: number}[];
}

function SelectDropdown({value, onChange, options}: SelectDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const selectedOption = options.find((opt) => opt.value === value);

	const trigger = (
		<button
			type='button'
			className='flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:outline-none hover:border-[#ff79c6] transition-all cursor-pointer'
		>
			<span>{selectedOption?.label}</span>
			<ChevronDown className='w-3 h-3 text-white/50' />
		</button>
	);

	return (
		<DropDownContent
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			align='left'
			className='max-h-[200px] overflow-y-auto py-1'
		>
			{options.map((option) => (
				<button
					key={option.value}
					type='button'
					onClick={() => {
						onChange(option.value);
						setIsOpen(false);
					}}
					className={`w-full px-3 py-1.5 text-left text-sm transition-all cursor-pointer
						${
							option.value === value
								? "bg-[#ff79c6]/20 text-[#ff79c6]"
								: "text-white/70 hover:bg-white/10 hover:text-white"
						}`}
				>
					{option.label}
				</button>
			))}
		</DropDownContent>
	);
}

export function DateInput({
	value,
	onChange,
	placeholder = "Chọn ngày",
	className = "",
}: DateInputProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
	const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

	const selectedDate = value ? new Date(value) : null;

	useEffect(() => {
		if (selectedDate) {
			setCurrentMonth(selectedDate.getMonth());
			setCurrentYear(selectedDate.getFullYear());
		}
	}, [value]);

	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const getFirstDayOfMonth = (month: number, year: number) => {
		return new Date(year, month, 1).getDay();
	};

	const handlePrevMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear(currentYear - 1);
		} else {
			setCurrentMonth(currentMonth - 1);
		}
	};

	const handleNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear(currentYear + 1);
		} else {
			setCurrentMonth(currentMonth + 1);
		}
	};

	const handleSelectDate = (day: number) => {
		const month = String(currentMonth + 1).padStart(2, "0");
		const dayStr = String(day).padStart(2, "0");
		onChange(`${currentYear}-${month}-${dayStr}`);
		setIsOpen(false);
	};

	const formatDisplayDate = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	const renderCalendar = () => {
		const daysInMonth = getDaysInMonth(currentMonth, currentYear);
		const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
		const days = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} className='w-9 h-9' />);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const isSelected =
				selectedDate &&
				selectedDate.getDate() === day &&
				selectedDate.getMonth() === currentMonth &&
				selectedDate.getFullYear() === currentYear;

			const isToday =
				new Date().getDate() === day &&
				new Date().getMonth() === currentMonth &&
				new Date().getFullYear() === currentYear;

			days.push(
				<button
					key={day}
					type='button'
					onClick={() => handleSelectDate(day)}
					className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer
						${
							isSelected
								? "bg-[#ff79c6] text-white"
								: isToday
								? "bg-white/10 text-[#ff79c6] border border-[#ff79c6]/50"
								: "text-white/70 hover:bg-white/10 hover:text-white"
						}`}
				>
					{day}
				</button>
			);
		}

		return days;
	};

	const monthOptions = MONTHS.map((month, index) => ({
		label: month,
		value: index,
	}));

	const yearOptions = [];
	const startYear = currentYear - 50;
	for (let i = 0; i < 100; i++) {
		yearOptions.push({label: String(startYear + i), value: startYear + i});
	}

	const trigger = (
		<div className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#ff79c6] transition-all cursor-pointer flex items-center justify-between'>
			<span className={value ? "text-white" : "text-white/30"}>
				{value ? formatDisplayDate(value) : placeholder}
			</span>
			<Calendar className='w-4 h-4 text-white/50' />
		</div>
	);

	return (
		<DropDownContent
			trigger={trigger}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			align='left'
			className={`p-4 min-w-[300px] ${className}`}
		>
			<div className='flex items-center justify-between mb-4'>
				<button
					type='button'
					onClick={handlePrevMonth}
					className='p-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer'
				>
					<ChevronLeft className='w-4 h-4 text-white/70' />
				</button>

				<div className='flex gap-2'>
					<SelectDropdown
						value={currentMonth}
						onChange={setCurrentMonth}
						options={monthOptions}
					/>
					<SelectDropdown
						value={currentYear}
						onChange={setCurrentYear}
						options={yearOptions}
					/>
				</div>

				<button
					type='button'
					onClick={handleNextMonth}
					className='p-2 rounded-lg hover:bg-white/10 transition-all cursor-pointer'
				>
					<ChevronRight className='w-4 h-4 text-white/70' />
				</button>
			</div>

			<div className='grid grid-cols-7 gap-1 mb-2'>
				{DAYS.map((day) => (
					<div
						key={day}
						className='w-9 h-9 flex items-center justify-center text-xs font-medium text-white/40'
					>
						{day}
					</div>
				))}
			</div>

			<div className='grid grid-cols-7 gap-1'>{renderCalendar()}</div>

			{value && (
				<button
					type='button'
					onClick={() => {
						onChange("");
						setIsOpen(false);
					}}
					className='w-full mt-3 py-2 text-sm text-white/50 hover:text-white/70 transition-all cursor-pointer'
				>
					Xóa ngày đã chọn
				</button>
			)}
		</DropDownContent>
	);
}
