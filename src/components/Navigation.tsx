'use client'
import React from 'react'; // 确保导入 React
import { useState, useEffect } from 'react'
import { Link, usePathname }from "@/lib/i18n";
import { Github, MenuIcon } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import IconImage from "../../public/favicon.svg";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeModeButton } from "@/components/ThemeModeButton";
import { LocaleButton } from "@/components/LocaleButton";
import {useTranslations} from 'next-intl';
type categoriesType = {
  name: string,
  src: string,
  description: string,
  link: string
}

type navigationProp = {
  categories: categoriesType[]
  mcpCategories: categoriesType[]
  cursorCategories: categoriesType[]
}


export const Navigation = ({ categories, mcpCategories, cursorCategories }: navigationProp ) => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('navigation');

  const menuItems: {
    label: string;
    href: string;
  }[] = [
    {
      label: t('homeBtn'),
      href: "/",
    },
    {
      label: t('categoryBtn'),
      href: "/category",
    },
    {
      label: t('articleBtn'),
      href: "/article",
    },
    {
      label: t('aboutBtn'),
      href: "/about",   
    },
  ];
  const isMenuItemActive = (href: string) => {
    // console.log(pathname, href);
    return pathname === href;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  
  const size = 30;
  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  })
  ListItem.displayName = "ListItem"
  return (

    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={IconImage}
              className="block"
              width={size}
              height={size}
              alt="DomainScore"
            />
            <span className="inline-block font-bold">aikratom.com</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className={cn(
                        navigationMenuTriggerStyle(),
                        'font-medium',
                        '/' === pathname && "font-extrabold"
                      )}
                    >
                      {t('homeBtn')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn('font-medium', '/category' === pathname && "font-extrabold")}>{t('categoryBtn')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                      {categories.map((category) => (
                        <ListItem
                          key={category.name}
                          title={category.name}
                          href={`/category/${category.link}`}
                          className='capitalize'
                        >
                          {category.description}
                        </ListItem>
                      ))}
                      <ListItem
                        title={t('moreCategoryBtn')}
                        href={'/category'}
                        className='capitalize border border-muted  bg-gradient-to-b  from-muted/50 to-muted/20'
                      >
                        {t('moreCategoryDescription')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
               
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn('font-medium', '/mcp' === pathname && "font-extrabold")}>
                    {t('mcpBtn')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                      {mcpCategories.map((category) => (
                        <ListItem
                          key={category.name}
                          title={category.name}
                          href={`/mcp/${category.link}`}
                          className='capitalize'
                        >
                          {category.description}
                        </ListItem>
                      ))}
                      <ListItem
                        title={t('moreMCPBtn')}
                        href={'/mcp'}
                        className='capitalize border border-muted bg-gradient-to-b from-muted/50 to-muted/20'
                      >
                        {t('moreMCPDescription')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn('font-medium', '/cursor' === pathname && "font-extrabold")}>
                    {t('cursorBtn')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] ">
                      {cursorCategories.map((category) => (
                        <ListItem
                          key={category.name}
                          title={category.name}
                          href={`/cursor/${category.link}`}
                          className='capitalize'
                        >
                          {category.description}
                        </ListItem>
                      ))}
                      <ListItem
                        title={t('moreCursorBtn')}
                        href={'/cursor'}
                        className='capitalize border border-muted bg-gradient-to-b from-muted/50 to-muted/20'
                      >
                        {t('moreCursorDescription')}
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {/* 提交工具 
          <Link href="/article/add-new-developer-tools" className='hidden md:block'>
            <Button variant="outline" className='text-sm tracking-tight'>{t('submitToolBtn')}</Button>
          </Link>*/}
          <div className="flex items-center gap-1">
            {/* <ThemeModeButton /> */}
            {/* <LocaleButton /> */}
            
          </div>
          {/*<Link
            href={"https://github.com/iAmCorey/devtoolset"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground ml-1"
          >
            <Github className="h-4 w-4" />
            <span className="sr-only">GitHub</span>
          </Link>*/}
          <Sheet
              open={mobileMenuOpen}
              onOpenChange={(open) => setMobileMenuOpen(open)}
            >
              <SheetTrigger asChild>
                <Button
                  className="md:hidden"
                  size="icon"
                  variant="outline"
                  aria-label="Menu"
                >
                  <MenuIcon className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[250px]" side="right">
                <div className="flex flex-col items-start justify-center">
                  {menuItems.map((menuItem) => (
                    <Link
                      key={menuItem.href}
                      href={menuItem.href}
                      className={cn(
                        "block px-3 py-2 text-lg",
                        isMenuItemActive(menuItem.href) ? "font-bold" : "",
                      )}
                    >
                      {menuItem.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  )
}