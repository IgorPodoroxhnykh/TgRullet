interface HeaderProps {
    title: string;
    subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    return (
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
            </p>
        </div>
    );
}