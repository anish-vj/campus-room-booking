export default function SiteFooter() {
    return (
          <footer className="bg-surface-container-lowest border-t border-surface-border w-full mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-6 py-6 max-w-container-max mx-auto w-full gap-2">
                        <span className="font-headline text-sm font-bold text-primary">CampusReserve</span>
                        <span className="text-xs text-text-muted text-center md:text-left">
                                  © {new Date().getFullYear()} Campus Facilities. Room Booking System.
                        </span>
                </div>
          </footer>
        );
}
